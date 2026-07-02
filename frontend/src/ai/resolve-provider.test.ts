import { describe, expect, it } from 'vitest'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import { OfflineTutorProvider } from './offline-provider'
import type { TutorProvider } from './provider'
import type { ProviderStreamEvent } from './provider.types'
import { resolveTutorProvider } from './resolve-provider'

const fakeWebLlm: TutorProvider = {
  async *streamMessage(): AsyncIterable<ProviderStreamEvent> {
    yield { type: 'message_stop', stopReason: 'stop' }
  },
}

describe('resolveTutorProvider', () => {
  it('uses the real session provider when present (web-llm path)', () => {
    expect(resolveTutorProvider(fakeWebLlm, WRITING_YOUR_FIRST_PROGRAM, 'Ohad')).toBe(fakeWebLlm)
  })

  it('falls back to the offline tutor when there is no session provider', () => {
    const provider = resolveTutorProvider(null, WRITING_YOUR_FIRST_PROGRAM, 'Ohad')
    expect(provider).toBeInstanceOf(OfflineTutorProvider)
  })
})
