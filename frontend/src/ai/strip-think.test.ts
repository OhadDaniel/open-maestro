import { describe, expect, it } from 'vitest'
import type { ProviderStreamEvent } from './provider.types'
import { stripThinkBlock } from './strip-think'

async function collect(source: AsyncIterable<ProviderStreamEvent>): Promise<string> {
  let text = ''
  for await (const event of source) {
    if (event.type === 'text_delta') {
      text += event.text
    }
  }
  return text
}

async function* fromChunks(chunks: string[]): AsyncIterable<ProviderStreamEvent> {
  for (const chunk of chunks) {
    yield { type: 'text_delta', text: chunk }
  }
  yield { type: 'message_stop', stopReason: 'stop' }
}

describe('stripThinkBlock', () => {
  it('strips an empty think block and emits what follows', async () => {
    const result = await collect(stripThinkBlock(fromChunks(['<think> </think>Hello, world!'])))
    expect(result).toBe('Hello, world!')
  })

  it('passes through cleanly when no think block present', async () => {
    const result = await collect(stripThinkBlock(fromChunks(['Hello, ', 'world!'])))
    expect(result).toBe('Hello, world!')
  })

  it('handles think tags split across chunk boundaries', async () => {
    const result = await collect(
      stripThinkBlock(fromChunks(['<th', 'ink', '> </thi', 'nk>Hello'])),
    )
    expect(result).toBe('Hello')
  })

  it('strips multiline think content and trims leading whitespace after close tag', async () => {
    const result = await collect(
      stripThinkBlock(fromChunks(['<think>\nsome reasoning\n</think>\n\nActual reply'])),
    )
    expect(result).toBe('Actual reply')
  })

  it('emits nothing when stream is only a think block with no content after', async () => {
    const result = await collect(stripThinkBlock(fromChunks(['<think> </think>'])))
    expect(result).toBe('')
  })
})
