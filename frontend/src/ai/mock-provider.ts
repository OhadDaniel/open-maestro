import type { TutorProvider } from './provider'
import type { ProviderRequest, ProviderStreamEvent } from './provider.types'

const MOCK_REPLY_PARTS = [
  'Let me walk you through it. ',
  'In Python, ',
  '`print()` displays text on the screen. ',
  'Try typing `print("Hello, world!")` and running it.',
]

const MOCK_DELTA_DELAY_MS = 40

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockTutorProvider implements TutorProvider {
  async *streamMessage(
    _request: ProviderRequest,
  ): AsyncIterable<ProviderStreamEvent> {
    for (const text of MOCK_REPLY_PARTS) {
      await delay(MOCK_DELTA_DELAY_MS)
      yield { type: 'text_delta', text }
    }
    yield { type: 'message_stop', stopReason: 'stop' }
  }
}
