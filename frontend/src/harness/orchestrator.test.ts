import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OPENING_BOOTSTRAP } from '../ai/offline-provider'
import type { TutorProvider } from '../ai/provider'
import type { ProviderMessage, ProviderRequest, ProviderStreamEvent } from '../ai/provider.types'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import { emptyProfile, withGoal, withName } from '../memory/learner-profile'
import { buildTutorRequest } from '../tutor/tutor-engine'
import { createSession } from '../tutor/session'
import { buildContext } from './buildContext'
import { NO_MISCONCEPTION, PASS_THROUGH_MOVE } from './constants'
import { defaultHarnessDeps, handleTurn, openLesson, renderOpeningLine } from './orchestrator'

const BAKED_NO_OPENING = { ...WRITING_YOUR_FIRST_PROGRAM, openingLine: '' }

function fakeProvider(chunks: string[]): TutorProvider {
  return {
    async *streamMessage(_request): AsyncIterable<ProviderStreamEvent> {
      for (const chunk of chunks) {
        yield { type: 'text_delta', text: chunk }
      }
      yield { type: 'message_stop', stopReason: 'stop' }
    },
  }
}

describe('handleTurn — H10 run-mastery + anti-stuck + repetition guard', () => {
  it('H10(a): celebrates with explain action on successful run (does not auto-master)', async () => {
    const provider = fakeProvider(['Your code ran and printed "hi" — you just made the computer output text!'])
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    let updatedSession = session
    const { action, masteryAdvanced } = await handleTurn(
      {
        userMessage: 'I ran this code:\n\nprint("hi")\n\nOutput:\nhi',
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile: emptyProfile(),
        messages: [],
        onToken: () => {},
        onProfileLearned: () => {},
        onSessionUpdated: (s) => { updatedSession = s },
        runResult: { ok: true, output: 'hi' },
      },
      deps,
    )
    expect(action).toBe('explain')
    expect(masteryAdvanced).toBe(false)
    expect(updatedSession.progress.masteredOutcomes).not.toContain('0')
  })

  it('H10(a): does not master when run fails', async () => {
    const provider = fakeProvider(['Try again.'])
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    let updatedSession = session
    await handleTurn(
      {
        userMessage: 'got an error',
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile: emptyProfile(),
        messages: [],
        onToken: () => {},
        onProfileLearned: () => {},
        onSessionUpdated: (s) => { updatedSession = s },
        runResult: { ok: false, output: 'SyntaxError: invalid syntax' },
      },
      deps,
    )
    expect(updatedSession.progress.masteredOutcomes).not.toContain('0')
  })

  it('advances when turnsOnCurrentOutcome reaches MAX_TURNS_PER_OUTCOME (2)', async () => {
    const provider = fakeProvider(['Moving on.'])
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    let updatedSession = session
    await handleTurn(
      {
        userMessage: 'still confused',
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile: emptyProfile(),
        messages: [],
        onToken: () => {},
        onProfileLearned: () => {},
        onSessionUpdated: (s) => { updatedSession = s },
        stuckCount: 2,
      },
      deps,
    )
    expect(updatedSession.progress.masteredOutcomes).toContain('0')
  })

  it('does not advance when turnsOnCurrentOutcome < MAX_TURNS_PER_OUTCOME', async () => {
    const provider = fakeProvider(['Let me explain differently.'])
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    let updatedSession = session
    await handleTurn(
      {
        userMessage: 'still confused',
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile: emptyProfile(),
        messages: [],
        onToken: () => {},
        onProfileLearned: () => {},
        onSessionUpdated: (s) => { updatedSession = s },
        stuckCount: 1,
      },
      deps,
    )
    expect(updatedSession.progress.masteredOutcomes).not.toContain('0')
  })

  it('H10(c): regenerates when draft is highly similar to previous tutor message', async () => {
    let callCount = 0
    const provider: TutorProvider = {
      async *streamMessage(): AsyncIterable<ProviderStreamEvent> {
        callCount += 1
        // First call: repetitive (>45% word overlap). Second call: fresh.
        const text = callCount === 1
          ? 'Please write a print statement using the print function to display output with print'
          : 'Now try running it — what happens?'
        yield { type: 'text_delta', text }
        yield { type: 'message_stop', stopReason: 'stop' }
      },
    }
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const prevTutorText = 'Please write a print statement using the print function to display output with print'
    const { draft } = await handleTurn(
      {
        userMessage: 'ok',
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile: emptyProfile(),
        messages: [{ role: 'assistant', content: prevTutorText }],
        onToken: () => {},
        onProfileLearned: () => {},
        onSessionUpdated: () => {},
      },
      deps,
    )
    // Guard fires → regenerate → returned draft is the replacement
    expect(callCount).toBe(2)
    expect(draft).toBe('Now try running it — what happens?')
  })

  it('H10(c): phrase guard regenerates when same boilerplate phrase appears in consecutive turns', async () => {
    let callCount = 0
    const provider: TutorProvider = {
      async *streamMessage(): AsyncIterable<ProviderStreamEvent> {
        callCount += 1
        const text = callCount === 1
          ? "Here's a nudge: remember to use the print function with parentheses"
          : "Try typing print and see what the editor suggests"
        yield { type: 'text_delta', text }
        yield { type: 'message_stop', stopReason: 'stop' }
      },
    }
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const { draft } = await handleTurn(
      {
        userMessage: 'how?',
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile: emptyProfile(),
        messages: [{ role: 'assistant', content: "Here's a nudge: start with the word print" }],
        onToken: () => {},
        onProfileLearned: () => {},
        onSessionUpdated: () => {},
      },
      deps,
    )
    expect(callCount).toBe(2)
    expect(draft).toBe("Try typing print and see what the editor suggests")
  })
})

describe('openLesson — H7b typewriter rate', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('reveals opening line in ≥3 growing steps on first mount', async () => {
    const provider: TutorProvider = {
      async *streamMessage(): AsyncIterable<ProviderStreamEvent> {
        yield { type: 'message_stop', stopReason: 'stop' }
      },
    }
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const profile = withName(emptyProfile(), 'Dana')
    const reveals: string[] = []

    const promise = openLesson(
      {
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile,
        skipRef: { current: false },
        onToken: () => {},
        onReveal: (t) => { reveals.push(t) },
      },
      deps,
    )
    await vi.runAllTimersAsync()
    await promise

    expect(reveals.length).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < reveals.length; i++) {
      expect(reveals[i].length).toBeGreaterThan(reveals[i - 1].length)
    }
    expect(reveals[reveals.length - 1]).toContain('Dana')
  })

  it('emits full text instantly when skipRef is true', async () => {
    const deps = defaultHarnessDeps(fakeProvider([]))
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const profile = withName(emptyProfile(), 'Dana')
    const reveals: string[] = []

    const promise = openLesson(
      {
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile,
        skipRef: { current: true },
        onToken: () => {},
        onReveal: (t) => { reveals.push(t) },
      },
      deps,
    )
    await vi.runAllTimersAsync()
    await promise

    expect(reveals.length).toBe(1)
    expect(reveals[0]).toContain('Dana')
  })
})

describe('handleTurn (slice 0)', () => {
  it('streams tokens and returns the full draft', async () => {
    const provider = fakeProvider(['Hello', ', ', 'world'])
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    let streamed = ''
    const { draft } = await handleTurn(
      {
        userMessage: 'hi',
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile: emptyProfile(),
        messages: [],
        onToken: (token) => {
          streamed += token
        },
        onProfileLearned: () => {},
        onSessionUpdated: () => {},
      },
      deps,
    )
    expect(draft).toBe('Hello, world')
    expect(streamed).toBe('Hello, world')
  })
})

describe('openLesson (slice 2)', () => {
  it('falls back to provider stream when openingLine is empty', async () => {
    let captured: ProviderRequest | undefined
    const provider: TutorProvider = {
      async *streamMessage(request): AsyncIterable<ProviderStreamEvent> {
        captured = request
        yield { type: 'text_delta', text: 'Hi Dana' }
        yield { type: 'message_stop', stopReason: 'stop' }
      },
    }
    const deps = defaultHarnessDeps(provider)
    const session = createSession(BAKED_NO_OPENING.lesson.id)
    const profile = withName(emptyProfile(), 'Dana')
    let streamed = ''
    const draft = await openLesson(
      {
        baked: BAKED_NO_OPENING,
        session,
        profile,
        onToken: (token) => {
          streamed += token
        },
      },
      deps,
    )
    expect(draft).toBe('Hi Dana')
    expect(streamed).toBe('Hi Dana')
    expect(captured?.system).toContain(BAKED_NO_OPENING.lesson.title)
    expect(captured?.system).toContain('Dana')
    expect(captured?.system).toContain('open the lesson yourself')
    expect(captured?.messages.at(-1)?.content).toBe(OPENING_BOOTSTRAP)
  })

  it('uses openingLine verbatim (no provider call) when non-empty', async () => {
    let providerCalled = false
    const provider: TutorProvider = {
      async *streamMessage(): AsyncIterable<ProviderStreamEvent> {
        providerCalled = true
        yield { type: 'message_stop', stopReason: 'stop' }
      },
    }
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const profile = withName(emptyProfile(), 'Dana')
    let revealed = ''
    const draft = await openLesson(
      {
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile,
        skipRef: { current: true },
        onToken: () => {},
        onReveal: (t) => { revealed = t },
      },
      deps,
    )
    expect(providerCalled).toBe(false)
    expect(draft).toContain('Dana')
    expect(revealed).toBe(draft)
  })

  it('uses onReveal with cumulative text for typewriter reveal', async () => {
    const provider: TutorProvider = {
      async *streamMessage(): AsyncIterable<ProviderStreamEvent> {
        yield { type: 'message_stop', stopReason: 'stop' }
      },
    }
    const deps = defaultHarnessDeps(provider)
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const profile = withName(emptyProfile(), 'Dana')
    const revealCalls: string[] = []
    await openLesson(
      {
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile,
        skipRef: { current: true },
        onToken: () => {},
        onReveal: (t) => { revealCalls.push(t) },
      },
      deps,
    )
    expect(revealCalls.length).toBe(1)
    expect(revealCalls[0]).toContain('Dana')
  })
})

describe('renderOpeningLine', () => {
  const base = { ...WRITING_YOUR_FIRST_PROGRAM, bridgeFromPreviousLesson: null }

  it('substitutes {name} from the learner profile', () => {
    const baked = { ...base, openingLine: 'Hi {name} — ready?' }
    expect(renderOpeningLine(baked, withName(emptyProfile(), 'Dana'))).toBe('Hi Dana — ready?')
  })

  it('uses "there" when profile name is null', () => {
    const baked = { ...base, openingLine: 'Hi {name}!' }
    expect(renderOpeningLine(baked, emptyProfile())).toBe('Hi there!')
  })

  it('substitutes {goal} wrapped in quotes when goal is present', () => {
    const baked = { ...base, openingLine: 'Goal: {goal}.' }
    const profile = withGoal(emptyProfile(), 'become a developer')
    expect(renderOpeningLine(baked, profile)).toBe('Goal: "become a developer".')
  })

  it('drops the entire sentence containing {goal} when goal is null', () => {
    const baked = { ...base, openingLine: 'Motivated by: {goal}.' }
    expect(renderOpeningLine(baked, emptyProfile())).toBe('')
  })

  it('drops only the {goal} sentence and keeps the rest', () => {
    const baked = { ...base, openingLine: 'Hi {name}. Motivated by: {goal}. Let\'s start.' }
    expect(renderOpeningLine(baked, withName(emptyProfile(), 'Sam'))).toBe('Hi Sam. Let\'s start.')
  })

  it('full persistence path: goal from profile renders quoted in opening', () => {
    const profile = withGoal(withName(emptyProfile(), 'Sam'), 'become a Python developer')
    const baked = { ...base, openingLine: 'Hi {name}. You said {goal}.' }
    expect(renderOpeningLine(baked, profile)).toBe('Hi Sam. You said "become a Python developer".')
  })

  it('appends bridge when non-null', () => {
    const baked = {
      ...base,
      openingLine: 'Hi {name}.',
      bridgeFromPreviousLesson: 'Last time you learned variables.',
    }
    const result = renderOpeningLine(baked, withName(emptyProfile(), 'Sam'))
    expect(result).toContain('Hi Sam.')
    expect(result).toContain('Last time you learned variables.')
  })

  it('does not append bridge when null', () => {
    const baked = { ...base, openingLine: 'Hi {name}.', bridgeFromPreviousLesson: null }
    expect(renderOpeningLine(baked, withName(emptyProfile(), 'Sam'))).toBe('Hi Sam.')
  })

  it('strips unknown template vars so no raw braces reach the screen', () => {
    const baked = { ...base, openingLine: 'Hi {name}, studying {course}.' }
    expect(renderOpeningLine(baked, withName(emptyProfile(), 'Sam'))).toBe('Hi Sam, studying .')
  })
})

describe('buildContext (slice 0)', () => {
  it('produces the same request as buildTutorRequest (zero behavior change)', () => {
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const profile = emptyProfile()
    const messages: ProviderMessage[] = [{ role: 'user', content: 'hi' }]
    const viaContext = buildContext({
      baked: WRITING_YOUR_FIRST_PROGRAM,
      session,
      profile,
      messages,
      move: PASS_THROUGH_MOVE,
      misconception: NO_MISCONCEPTION,
    })
    const direct = buildTutorRequest(WRITING_YOUR_FIRST_PROGRAM, session, profile, messages)
    expect(viaContext).toEqual(direct)
  })

  it('injects the move rules into the system prompt', () => {
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const request = buildContext({
      baked: WRITING_YOUR_FIRST_PROGRAM,
      session,
      profile: emptyProfile(),
      messages: [],
      move: { action: 'close', rules: ['Wrap up in one line.'], reason: 'test' },
      misconception: NO_MISCONCEPTION,
    })
    expect(request.system).toContain('Wrap up in one line.')
    expect(request.system).toContain('"close"')
  })
})
