import { withGoal, withName } from './learner-profile'
import type { LearnerProfile } from './learner-profile.types'

const NAME_PATTERN = /(?:call me|my name is|i am called|name'?s)\s+([a-z][a-z'-]{1,20})/i
const GOAL_PATTERN =
  /(?:i want to|i'd like to|i wanna|trying to|my goal is to|hoping to)\s+([^.!?\n]{4,80})/i

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function learnFromMessage(
  profile: LearnerProfile,
  message: string,
): LearnerProfile {
  let next = profile
  if (next.name === null) {
    const nameMatch = NAME_PATTERN.exec(message)
    if (nameMatch) {
      next = withName(next, capitalize(nameMatch[1]))
    }
  }
  if (next.goal === null) {
    const goalMatch = GOAL_PATTERN.exec(message)
    if (goalMatch) {
      next = withGoal(next, goalMatch[1].trim())
    }
  }
  return next
}
