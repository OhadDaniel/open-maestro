import { OPENING_BOOTSTRAP } from '../ai/offline-provider'
import type { TutorProvider } from '../ai/provider'
import type { ProviderMessage, ProviderRequest } from '../ai/provider.types'
import { stripThinkBlock } from '../ai/strip-think'
import type { BakedLesson } from '../content/baked.types'
import type { TutorSession } from '../content/session.types'
import type { LearnerProfile } from '../memory/learner-profile.types'
import {
  completeLesson,
  declineWrap,
  masterOutcome,
  offerWrap,
} from '../tutor/session'
import { buildContext } from './buildContext'
import { controller } from './decide/controller'
import { memoryCurator } from './remember/memoryCurator'
import { affectObserver } from './sense/affectObserver'
import { masteryTracer } from './sense/masteryTracer'
import { misconceptionDiagnoser } from './sense/misconceptionDiagnoser'
import type { TeachingMove } from './types'
import { WITHHOLD_FALLBACK, answerLeakGuard, isGuardedMode } from './verify/answerLeakGuard'
import { groundingGuard } from './verify/groundingGuard'

export type OnToken = (text: string) => void

const TW_CHARS = 3          // characters per reveal step
const TW_CHAR_MS = 18       // target delay per character
const TW_MIN_MS = 800       // minimum total reveal duration

async function typewriterReveal(
  text: string,
  onReveal: (text: string) => void,
  skipRef?: { current: boolean },
): Promise<void> {
  const steps = Math.max(1, Math.ceil(text.length / TW_CHARS))
  const naturalMs = steps * TW_CHAR_MS * TW_CHARS
  const delayMs = naturalMs < TW_MIN_MS
    ? Math.ceil(TW_MIN_MS / steps)
    : TW_CHAR_MS * TW_CHARS
  for (let pos = TW_CHARS; pos < text.length; pos += TW_CHARS) {
    if (skipRef?.current) {
      onReveal(text)
      return
    }
    onReveal(text.slice(0, pos))
    await new Promise<void>((r) => setTimeout(r, delayMs))
  }
  onReveal(text)
}

// H10(c): repetition guard helpers
const REPETITION_KEYWORD = /[a-z]{5,}/g
const REPETITION_THRESHOLD = 0.6
const REPHRASE_DIRECTIVE = 'React to what just happened, say it differently, shorter.'
const MIN_REPETITION_LENGTH = 40

function repetitionKeywords(text: string): Set<string> {
  return new Set(text.toLowerCase().match(REPETITION_KEYWORD) ?? [])
}

function isRepetitive(draft: string, prevTutor: string): boolean {
  if (draft.length < MIN_REPETITION_LENGTH || prevTutor.length < MIN_REPETITION_LENGTH) return false
  const draftWords = repetitionKeywords(draft)
  if (draftWords.size === 0) return false
  const prevWords = repetitionKeywords(prevTutor)
  const overlap = [...draftWords].filter((w) => prevWords.has(w)).length
  return overlap / draftWords.size > REPETITION_THRESHOLD
}

export type TurnInput = {
  userMessage: string
  baked: BakedLesson
  session: TutorSession
  profile: LearnerProfile
  messages: ProviderMessage[]
  onToken: OnToken
  onProfileLearned: (profile: LearnerProfile) => void
  onSessionUpdated: (session: TutorSession) => void
  runResult?: { ok: boolean; output: string }
  stuckCount?: number
}

export type TutorRunner = {
  stream: (request: ProviderRequest, onToken: OnToken) => Promise<string>
}

export type HarnessDeps = {
  affectObserver: typeof affectObserver
  masteryTracer: typeof masteryTracer
  misconceptionDiagnoser: typeof misconceptionDiagnoser
  controller: typeof controller
  answerLeakGuard: typeof answerLeakGuard
  groundingGuard: typeof groundingGuard
  memoryCurator: typeof memoryCurator
  tutor: TutorRunner
}

export function createProviderTutor(provider: TutorProvider): TutorRunner {
  return {
    stream: async (request, onToken) => {
      let text = ''
      for await (const event of stripThinkBlock(provider.streamMessage(request))) {
        if (event.type === 'text_delta') {
          text += event.text
          onToken(event.text)
        }
      }
      return text
    },
  }
}

export function defaultHarnessDeps(provider: TutorProvider): HarnessDeps {
  return {
    affectObserver,
    masteryTracer,
    misconceptionDiagnoser,
    controller,
    answerLeakGuard,
    groundingGuard,
    memoryCurator,
    tutor: createProviderTutor(provider),
  }
}

const NO_STREAM: OnToken = () => {}

function countStudentTurns(messages: ProviderMessage[]): number {
  return messages.filter((message) => message.role === 'user').length
}

async function regenerate(
  request: ProviderRequest,
  directive: string,
  deps: HarnessDeps,
): Promise<string> {
  const stricter: ProviderRequest = {
    system: `${request.system}\n\n${directive}`,
    messages: request.messages,
  }
  return deps.tutor.stream(stricter, NO_STREAM)
}

// Returns draft without calling onToken — caller emits.
async function generateGuarded(
  request: ProviderRequest,
  input: TurnInput,
  deps: HarnessDeps,
): Promise<string> {
  let draft = await deps.tutor.stream(request, NO_STREAM)
  const leak = deps.answerLeakGuard(draft, input.session, input.baked)
  if (leak.tripped && leak.directive !== undefined) {
    draft = await regenerate(request, leak.directive, deps)
    if (deps.answerLeakGuard(draft, input.session, input.baked).tripped) {
      return WITHHOLD_FALLBACK
    }
  }
  const grounding = deps.groundingGuard(draft, input.baked)
  if (grounding.tripped && grounding.directive !== undefined) {
    draft = await regenerate(request, grounding.directive, deps)
  }
  return draft
}

type SessionEffects = { session: TutorSession; masteryAdvanced: boolean }

function applySessionEffects(
  session: TutorSession,
  move: TeachingMove,
  mastery: ReturnType<typeof masteryTracer>,
): SessionEffects {
  let next = session
  let masteryAdvanced = false

  if (move.action === 'advance') {
    const practicingIndex = mastery.skills.findIndex((s) => s.status === 'practicing')
    if (practicingIndex >= 0 && !next.progress.masteredOutcomes.includes(String(practicingIndex))) {
      next = masterOutcome(next, practicingIndex)
      masteryAdvanced = true
    }
  }

  if (move.action === 'offer-wrap') {
    next = offerWrap(next)
  } else if (
    next.progress.wrapOffered &&
    !next.progress.wrapDeclined &&
    move.action !== 'wrap-lesson' &&
    move.reason === 'wrap-declined'
  ) {
    next = declineWrap(next)
  }

  if (move.action === 'wrap-lesson' && !next.progress.completed) {
    next = completeLesson(next)
  }

  return { session: next, masteryAdvanced }
}

export type TurnResult = { draft: string; action: TeachingMove['action']; masteryAdvanced: boolean }

export async function handleTurn(input: TurnInput, deps: HarnessDeps): Promise<TurnResult> {
  const affect = deps.affectObserver(input.userMessage, input.messages)
  const mastery = deps.masteryTracer(input.session, input.baked)
  const misconception = deps.misconceptionDiagnoser(input.userMessage, input.baked)
  const move = deps.controller({
    lesson: input.baked,
    session: input.session,
    affect,
    mastery,
    misconception,
    turnIndex: countStudentTurns(input.messages),
    userMessage: input.userMessage,
    runResult: input.runResult,
    turnsOnCurrentOutcome: input.stuckCount ?? 0,
  })

  if (move.action === 'offer-wrap') {
    const effects = applySessionEffects(input.session, move, mastery)
    queueMicrotask(() => {
      if (effects.session !== input.session) input.onSessionUpdated(effects.session)
      const updated = deps.memoryCurator(input.userMessage, input.profile)
      if (updated !== input.profile) input.onProfileLearned(updated)
    })
    return { draft: '', action: 'offer-wrap', masteryAdvanced: effects.masteryAdvanced }
  }

  const request = buildContext({
    baked: input.baked,
    session: input.session,
    profile: input.profile,
    messages: input.messages,
    move,
    misconception,
  })

  // Generate draft without streaming — emit after all guards pass
  let draft: string
  if (isGuardedMode(input.session.mode)) {
    draft = await generateGuarded(request, input, deps)
  } else {
    draft = await deps.tutor.stream(request, NO_STREAM)
    // P1-4: grounding guard applies to all modes
    const grounding = deps.groundingGuard(draft, input.baked)
    if (grounding.tripped && grounding.directive !== undefined) {
      draft = await regenerate(request, grounding.directive, deps)
    }
  }

  // H10(c): repetition guard — regenerate if draft is too similar to previous tutor message
  const prevTutor = input.messages.findLast((m) => m.role === 'assistant')?.content ?? ''
  if (isRepetitive(draft, prevTutor)) {
    draft = await regenerate(request, REPHRASE_DIRECTIVE, deps)
  }

  input.onToken(draft)

  const effects = applySessionEffects(input.session, move, mastery)
  queueMicrotask(() => {
    if (effects.session !== input.session) input.onSessionUpdated(effects.session)
    const updated = deps.memoryCurator(input.userMessage, input.profile)
    if (updated !== input.profile) input.onProfileLearned(updated)
  })

  return { draft, action: move.action, masteryAdvanced: effects.masteryAdvanced }
}

export type OpeningInput = {
  baked: BakedLesson
  session: TutorSession
  profile: LearnerProfile
  onToken: OnToken
  onReveal?: (text: string) => void
  skipRef?: { current: boolean }
}

const OPENING_MOVE: TeachingMove = {
  action: 'explain',
  rules: [
    'This is your first message — open the lesson yourself.',
    'Greet the student by name if their saved memory includes one.',
    'In 2 to 4 short sentences, introduce what this lesson covers using the lesson material, then ask one simple question to get them started.',
    'Do not reveal answers or dump the whole lesson; invite them in.',
  ],
  reason: 'lesson-opening',
}

function dropGoalSentences(text: string): string {
  // Split on sentence-terminal punctuation followed by whitespace,
  // keeping the punctuation on the preceding sentence.
  const parts = text.replace(/([.!?])\s+/g, '$1\x00').split('\x00')
  return parts.filter((s) => !s.includes('{goal}')).join(' ')
}

export function renderOpeningLine(baked: BakedLesson, profile: LearnerProfile): string {
  const name = profile.name ?? 'there'
  const goalRaw = profile.goal
  const base = goalRaw !== null ? baked.openingLine : dropGoalSentences(baked.openingLine)
  const goalSubstitution = goalRaw !== null ? `"${goalRaw}"` : ''
  let text = base
    .replace('{name}', name)
    .replace('{goal}', goalSubstitution)
    .replace(/\{[^}]+\}/g, '')
    .trim()
  if (baked.bridgeFromPreviousLesson !== null) {
    text += '\n\n' + baked.bridgeFromPreviousLesson
  }
  return text
}

export async function openLesson(input: OpeningInput, deps: HarnessDeps): Promise<string> {
  if (input.baked.openingLine.length > 0) {
    const text = renderOpeningLine(input.baked, input.profile)
    if (input.onReveal !== undefined) {
      await typewriterReveal(text, input.onReveal, input.skipRef)
    } else {
      input.onToken(text)
    }
    return text
  }
  const messages: ProviderMessage[] = [{ role: 'user', content: OPENING_BOOTSTRAP }]
  const request = buildContext({
    baked: input.baked,
    session: input.session,
    profile: input.profile,
    messages,
    move: OPENING_MOVE,
    misconception: { matched: false },
  })
  return deps.tutor.stream(request, input.onToken)
}
