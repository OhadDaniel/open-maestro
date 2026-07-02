import { describe, expect, it } from 'vitest'
import type { TutorProvider } from '../ai/provider'
import type { ProviderMessage, ProviderStreamEvent } from '../ai/provider.types'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import { emptyProfile } from '../memory/learner-profile'
import { buildTutorRequest } from '../tutor/tutor-engine'
import { createSession } from '../tutor/session'
import { buildContext } from './buildContext'
import { NO_MISCONCEPTION, PASS_THROUGH_MOVE } from './constants'
import { defaultHarnessDeps, handleTurn } from './orchestrator'

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
      },
      deps,
    )
    expect(draft).toBe('Hello, world')
    expect(streamed).toBe('Hello, world')
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
