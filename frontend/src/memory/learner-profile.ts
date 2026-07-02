import type { LearnerProfile } from './learner-profile.types'
import { PROFILE_ENTRY_MAX, PROFILE_LIST_MAX } from './learner-profile.types'

export function emptyProfile(): LearnerProfile {
  return { name: null, goal: null, preferences: [], struggles: [], wins: [] }
}

function cleanEntry(value: string): string {
  return value.trim().slice(0, PROFILE_ENTRY_MAX)
}

function pushCapped(list: string[], entry: string): string[] {
  const cleaned = cleanEntry(entry)
  if (cleaned.length === 0 || list.includes(cleaned)) {
    return list
  }
  return [...list, cleaned].slice(-PROFILE_LIST_MAX)
}

export function withName(profile: LearnerProfile, name: string): LearnerProfile {
  const cleaned = cleanEntry(name)
  return { ...profile, name: cleaned.length > 0 ? cleaned : null }
}

export function withGoal(profile: LearnerProfile, goal: string): LearnerProfile {
  const cleaned = cleanEntry(goal)
  return { ...profile, goal: cleaned.length > 0 ? cleaned : null }
}

export function rememberPreference(profile: LearnerProfile, entry: string): LearnerProfile {
  return { ...profile, preferences: pushCapped(profile.preferences, entry) }
}

export function rememberStruggle(profile: LearnerProfile, entry: string): LearnerProfile {
  return { ...profile, struggles: pushCapped(profile.struggles, entry) }
}

export function rememberWin(profile: LearnerProfile, entry: string): LearnerProfile {
  return { ...profile, wins: pushCapped(profile.wins, entry) }
}

const EMPTY_SNAPSHOT = 'No saved profile yet — take a moment to get to know the student.'

export function renderProfileSnapshot(profile: LearnerProfile): string {
  const lines: string[] = []
  if (profile.name) {
    lines.push(`Name: ${profile.name}`)
  }
  if (profile.goal) {
    lines.push(`Goal: ${profile.goal}`)
  }
  if (profile.preferences.length > 0) {
    lines.push(`Prefers: ${profile.preferences.join('; ')}`)
  }
  if (profile.struggles.length > 0) {
    lines.push(`Has struggled with: ${profile.struggles.join('; ')}`)
  }
  if (profile.wins.length > 0) {
    lines.push(`Past wins: ${profile.wins.join('; ')}`)
  }
  return lines.length > 0 ? lines.join('\n') : EMPTY_SNAPSHOT
}
