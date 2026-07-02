import { describe, expect, it } from 'vitest'
import {
  emptyProfile,
  rememberStruggle,
  rememberWin,
  renderProfileSnapshot,
  withGoal,
  withName,
} from './learner-profile'
import { PROFILE_LIST_MAX } from './learner-profile.types'

describe('learner profile', () => {
  it('starts empty with a friendly snapshot', () => {
    expect(renderProfileSnapshot(emptyProfile())).toContain('No saved profile yet')
  })

  it('records name and goal into the snapshot', () => {
    let profile = withName(emptyProfile(), 'Liz')
    profile = withGoal(profile, 'become an AI engineer')
    const snapshot = renderProfileSnapshot(profile)
    expect(snapshot).toContain('Name: Liz')
    expect(snapshot).toContain('Goal: become an AI engineer')
  })

  it('deduplicates repeated entries', () => {
    let profile = rememberWin(emptyProfile(), 'printed Hello world')
    profile = rememberWin(profile, 'printed Hello world')
    expect(profile.wins).toEqual(['printed Hello world'])
  })

  it('caps a list at the maximum, keeping the most recent', () => {
    let profile = emptyProfile()
    for (let index = 0; index < PROFILE_LIST_MAX + 3; index += 1) {
      profile = rememberStruggle(profile, `struggle ${index}`)
    }
    expect(profile.struggles).toHaveLength(PROFILE_LIST_MAX)
    expect(profile.struggles.at(-1)).toBe(`struggle ${PROFILE_LIST_MAX + 2}`)
  })
})
