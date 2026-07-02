import { describe, expect, it } from 'vitest'
import { emptyProfile, withGoal, withName } from '../../memory/learner-profile'
import { userFromProfile } from './session-hydrate'

describe('userFromProfile', () => {
  it('hydrates name and goal from a saved profile', () => {
    const profile = withGoal(withName(emptyProfile(), 'Ohad Daniel'), 'switching careers')
    const user = userFromProfile(profile)
    expect(user.name).toBe('Ohad Daniel')
    expect(user.why).toBe('switching careers')
  })

  it('leaves name and goal empty for a fresh profile (no fake name)', () => {
    const user = userFromProfile(emptyProfile())
    expect(user.name).toBe('')
    expect(user.why).toBe('')
  })
})
