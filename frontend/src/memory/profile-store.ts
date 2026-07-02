import { emptyProfile } from './learner-profile'
import type { LearnerProfile } from './learner-profile.types'
import { learnerProfileSchema } from './learner-profile.types'

const STORAGE_KEY = 'open-maestro.learner-profile.v1'

export function loadProfile(): LearnerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return emptyProfile()
    }
    const parsed = learnerProfileSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : emptyProfile()
  } catch {
    return emptyProfile()
  }
}

export function saveProfile(profile: LearnerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    return
  }
}
