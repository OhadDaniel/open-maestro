import { describe, expect, it } from 'vitest'
import { learnFromMessage } from './extract'
import { emptyProfile } from './learner-profile'

describe('learnFromMessage', () => {
  it('captures a name from "call me X"', () => {
    expect(learnFromMessage(emptyProfile(), 'ok call me Liz please').name).toBe('Liz')
  })

  it('does not mistake "I\'m tired" for a name', () => {
    expect(learnFromMessage(emptyProfile(), "I'm tired today").name).toBeNull()
  })

  it('captures a goal', () => {
    const profile = learnFromMessage(emptyProfile(), 'I want to become an AI engineer')
    expect(profile.goal).toContain('become an AI engineer')
  })

  it('does not overwrite an existing name', () => {
    const existing = { ...emptyProfile(), name: 'Matt' }
    expect(learnFromMessage(existing, 'call me Bob').name).toBe('Matt')
  })
})
