import type { RetrievedChunk } from '../ai/grounding.types'
import type { TutorProvider } from '../ai/provider'
import type { ProviderRequest, ProviderStreamEvent } from '../ai/provider.types'
import { buildLessonContextBlock, buildTutorUserPrompt } from '../ai/tutor-prompt'
import type { BakedLesson } from '../content/baked.types'
import type { TutorSession } from '../content/session.types'
import { buildTutorSystemPrompt } from './tutor-rules'

function toRetrievedChunks(baked: BakedLesson): RetrievedChunk[] {
  return baked.chunks.map((chunk) => ({
    id: chunk.id,
    text: chunk.text,
    source: baked.lesson.title,
  }))
}

export function buildTutorRequest(
  baked: BakedLesson,
  session: TutorSession,
  studentMessage: string,
): ProviderRequest {
  const context = buildLessonContextBlock(toRetrievedChunks(baked))
  return {
    system: buildTutorSystemPrompt(baked, session),
    messages: [
      { role: 'user', content: buildTutorUserPrompt(context, studentMessage) },
    ],
  }
}

export function streamTutorReply(
  provider: TutorProvider,
  baked: BakedLesson,
  session: TutorSession,
  studentMessage: string,
): AsyncIterable<ProviderStreamEvent> {
  return provider.streamMessage(buildTutorRequest(baked, session, studentMessage))
}

export async function collectReplyText(
  events: AsyncIterable<ProviderStreamEvent>,
): Promise<string> {
  let text = ''
  for await (const event of events) {
    if (event.type === 'text_delta') {
      text += event.text
    }
  }
  return text
}
