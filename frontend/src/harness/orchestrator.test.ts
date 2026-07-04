import { describe, expect, it } from 'vitest'
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
    let streamed = ''
    const draft = await openLesson(
      {
        baked: WRITING_YOUR_FIRST_PROGRAM,
        session,
        profile,
        onToken: (t) => { streamed += t },
      },
      deps,
    )
    expect(providerCalled).toBe(false)
    expect(draft).toContain('Dana')
    expect(streamed).toBe(draft)
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
