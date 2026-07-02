import type { TutorProvider } from '../ai/provider'
import type {
  ProviderMessage,
  ProviderRequest,
  ProviderStreamEvent,
} from '../ai/provider.types'
import type { BakedLesson } from '../content/baked.types'
import type { TutorSession } from '../content/session.types'
import type { LearnerProfile } from '../memory/learner-profile.types'
import type { TutorPolicy } from './tutor-rules'
import { DEFAULT_POLICY, buildTutorSystemPrompt } from './tutor-rules'

export function buildTutorRequest(
  baked: BakedLesson,
  session: TutorSession,
  profile: LearnerProfile,
  messages: ProviderMessage[],
  policy: TutorPolicy = DEFAULT_POLICY,
): ProviderRequest {
  return {
    system: buildTutorSystemPrompt(baked, session, profile, policy),
    messages,
  }
}

export function streamTutorReply(
  provider: TutorProvider,
  baked: BakedLesson,
  session: TutorSession,
  profile: LearnerProfile,
  messages: ProviderMessage[],
  policy: TutorPolicy = DEFAULT_POLICY,
): AsyncIterable<ProviderStreamEvent> {
  return provider.streamMessage(
    buildTutorRequest(baked, session, profile, messages, policy),
  )
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
