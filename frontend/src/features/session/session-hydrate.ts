import type { LearnerProfile } from '../../memory/learner-profile.types'
import { INITIAL_USER } from './session.constants'
import type { SessionUser } from './session.types'

export function userFromProfile(profile: LearnerProfile): SessionUser {
  return {
    ...INITIAL_USER,
    name: profile.name ?? '',
    why: profile.goal ?? '',
  }
}
