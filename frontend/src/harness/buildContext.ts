import type { ProviderMessage, ProviderRequest } from '../ai/provider.types'
import type { BakedLesson } from '../content/baked.types'
import type { TutorSession } from '../content/session.types'
import type { LearnerProfile } from '../memory/learner-profile.types'
import { buildTutorRequest } from '../tutor/tutor-engine'
import type { TutorPolicy } from '../tutor/tutor-rules'
import { DEFAULT_POLICY } from '../tutor/tutor-rules'
import type { MisconceptionSignal, TeachingMove } from './types'

export type BuildContextInput = {
  baked: BakedLesson
  session: TutorSession
  profile: LearnerProfile
  messages: ProviderMessage[]
  move: TeachingMove
  misconception: MisconceptionSignal
  policy?: TutorPolicy
}

function turnDirective(move: TeachingMove): string {
  if (move.rules.length === 0) {
    return ''
  }
  const lines = move.rules.map((rule) => `- ${rule}`)
  return [`For THIS reply your move is "${move.action}". Do exactly this:`, ...lines].join('\n')
}

export function buildContext(input: BuildContextInput): ProviderRequest {
  const base = buildTutorRequest(
    input.baked,
    input.session,
    input.profile,
    input.messages,
    input.policy ?? DEFAULT_POLICY,
  )
  const directive = turnDirective(input.move)
  if (directive.length === 0) {
    return base
  }
  return { system: `${base.system}\n\n${directive}`, messages: base.messages }
}
