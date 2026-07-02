import { learnFromMessage } from '../../memory/extract'
import type { LearnerProfile } from '../../memory/learner-profile.types'

export function memoryCurator(userMessage: string, profile: LearnerProfile): LearnerProfile {
  return learnFromMessage(profile, userMessage)
}
