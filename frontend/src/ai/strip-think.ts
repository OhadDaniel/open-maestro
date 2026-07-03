import type { ProviderStreamEvent } from './provider.types'

const OPEN_TAG = '<think>'
const CLOSE_TAG = '</think>'

type FilterState = 'scanning' | 'in-think' | 'passthrough'

export async function* stripThinkBlock(
  source: AsyncIterable<ProviderStreamEvent>,
): AsyncIterable<ProviderStreamEvent> {
  let state: FilterState = 'scanning'
  let buffer = ''

  for await (const event of source) {
    if (event.type !== 'text_delta' || state === 'passthrough') {
      yield event
      continue
    }

    buffer += event.text

    if (state === 'scanning') {
      const openIdx = buffer.indexOf(OPEN_TAG)
      if (openIdx >= 0) {
        const before = buffer.slice(0, openIdx)
        buffer = buffer.slice(openIdx + OPEN_TAG.length)
        state = 'in-think'
        if (before.length > 0) {
          yield { type: 'text_delta', text: before }
        }
      } else if (OPEN_TAG.startsWith(buffer)) {
        // buffer is a prefix of OPEN_TAG — keep accumulating
      } else {
        yield { type: 'text_delta', text: buffer }
        buffer = ''
        state = 'passthrough'
      }
    }

    if (state === 'in-think') {
      const closeIdx = buffer.indexOf(CLOSE_TAG)
      if (closeIdx >= 0) {
        const afterClose = buffer.slice(closeIdx + CLOSE_TAG.length).replace(/^\s+/, '')
        buffer = ''
        state = 'passthrough'
        if (afterClose.length > 0) {
          yield { type: 'text_delta', text: afterClose }
        }
      }
    }
  }

  if (state === 'scanning' && buffer.length > 0) {
    yield { type: 'text_delta', text: buffer }
  }
}
