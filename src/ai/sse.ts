import {
  SSE_DATA_PREFIX,
  SSE_EVENT_PREFIX,
  SSE_FRAME_SEPARATOR,
} from './sse.constants'

export type SseFrame = { event: string; data: string }

export function parseSseFrames(buffer: string): {
  frames: SseFrame[]
  rest: string
} {
  const blocks = buffer.split(SSE_FRAME_SEPARATOR)
  const rest = blocks.pop() ?? ''
  const frames = blocks
    .map(parseFrame)
    .filter((frame): frame is SseFrame => frame !== null)
  return { frames, rest }
}

function parseFrame(block: string): SseFrame | null {
  let event = ''
  let data = ''
  for (const line of block.split('\n')) {
    if (line.startsWith(SSE_EVENT_PREFIX)) {
      event = line.slice(SSE_EVENT_PREFIX.length).trim()
    } else if (line.startsWith(SSE_DATA_PREFIX)) {
      data += line.slice(SSE_DATA_PREFIX.length).trim()
    }
  }
  return event ? { event, data } : null
}
