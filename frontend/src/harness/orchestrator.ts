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

export type TurnInput = {
  userMessage: string
  baked: BakedLesson
  session: TutorSession
  profile: LearnerProfile
  messages: ProviderMessage[]
  onToken: OnToken
  onProfileLearned: (profile: LearnerProfile) => void
  onSessionUpdated: (session: TutorSession) => void
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
      input.onToken(WITHHOLD_FALLBACK)
      return WITHHOLD_FALLBACK
    }
  }
  const grounding = deps.groundingGuard(draft, input.baked)
  if (grounding.tripped && grounding.directive !== undefined) {
    draft = await regenerate(request, grounding.directive, deps)
  }
  input.onToken(draft)
  return draft
}

function applySessionEffects(
  session: TutorSession,
  move: TeachingMove,
  mastery: ReturnType<typeof masteryTracer>,
): TutorSession {
  let next = session

  if (move.action === 'advance' && move.reason === 'confident-claim') {
    const practicingIndex = mastery.skills.findIndex((s) => s.status === 'practicing')
    if (practicingIndex >= 0) {
      next = masterOutcome(next, practicingIndex)
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

  return next
}

export type TurnResult = { draft: string; action: TeachingMove['action'] }

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
  })

  if (move.action === 'offer-wrap') {
    queueMicrotask(() => {
      const updatedSession = applySessionEffects(input.session, move, mastery)
      if (updatedSession !== input.session) input.onSessionUpdated(updatedSession)
      const updated = deps.memoryCurator(input.userMessage, input.profile)
      if (updated !== input.profile) input.onProfileLearned(updated)
    })
    return { draft: '', action: 'offer-wrap' }
  }

  const request = buildContext({
    baked: input.baked,
    session: input.session,
    profile: input.profile,
    messages: input.messages,
    move,
    misconception,
  })
  const draft = isGuardedMode(input.session.mode)
    ? await generateGuarded(request, input, deps)
    : await deps.tutor.stream(request, input.onToken)
  queueMicrotask(() => {
    const updatedSession = applySessionEffects(input.session, move, mastery)
    if (updatedSession !== input.session) input.onSessionUpdated(updatedSession)
    const updated = deps.memoryCurator(input.userMessage, input.profile)
    if (updated !== input.profile) input.onProfileLearned(updated)
  })
  return { draft, action: move.action }
}

export type OpeningInput = {
  baked: BakedLesson
  session: TutorSession
  profile: LearnerProfile
  onToken: OnToken
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

export function renderOpeningLine(baked: BakedLesson, profile: LearnerProfile): string {
  const name = profile.name ?? 'there'
  let text = baked.openingLine
    .replace('{name}', name)
    .replace('{goal}', profile.goal ?? '')
    .trim()
  if (baked.bridgeFromPreviousLesson !== null) {
    text += '\n\n' + baked.bridgeFromPreviousLesson
  }
  return text
}

export async function openLesson(input: OpeningInput, deps: HarnessDeps): Promise<string> {
  if (input.baked.openingLine.length > 0) {
    const text = renderOpeningLine(input.baked, input.profile)
    input.onToken(text)
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
