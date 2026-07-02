import { describe, expect, it } from 'vitest'
import { OPENING_BOOTSTRAP } from '../ai/offline-provider'
import type { TutorProvider } from '../ai/provider'
import type { ProviderMessage, ProviderRequest, ProviderStreamEvent } from '../ai/provider.types'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import { emptyProfile, withName } from '../memory/learner-profile'
import { buildTutorRequest } from '../tutor/tutor-engine'
import { createSession } from '../tutor/session'
import { buildContext } from './buildContext'
import { NO_MISCONCEPTION, PASS_THROUGH_MOVE } from './constants'
import { defaultHarnessDeps, handleTurn, openLesson } from './orchestrator'

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
    const draft = await handleTurn(
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
  it('streams a tutor-led opening grounded in the lesson and greeting by name', async () => {
    let captured: ProviderRequest | undefined
    const provider: TutorProvider = {
      async *streamMessage(request): AsyncIterable<ProviderStreamEvent> {
        captured = request
        yield { type: 'text_delta', text: 'Hi Dana' }
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
        onToken: (token) => {
          streamed += token
        },
      },
      deps,
    )
    expect(draft).toBe('Hi Dana')
    expect(streamed).toBe('Hi Dana')
    expect(captured?.system).toContain(WRITING_YOUR_FIRST_PROGRAM.lesson.title)
    expect(captured?.system).toContain('Dana')
    expect(captured?.system).toContain('open the lesson yourself')
    expect(captured?.messages.at(-1)?.content).toBe(OPENING_BOOTSTRAP)
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
