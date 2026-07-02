import { describe, expect, it } from 'vitest'
import {
  completeLesson,
  createSession,
  passCheck,
  setMode,
  setName,
} from './session'

describe('tutor session', () => {
  it('creates a default session in explain mode', () => {
    const session = createSession('lesson-1')
    expect(session.mode).toBe('explain')
    expect(session.prefs.name).toBeNull()
    expect(session.progress.completed).toBe(false)
  })

  it('sets the student name', () => {
    expect(setName(createSession('l'), 'Matt').prefs.name).toBe('Matt')
  })

  it('switches mode', () => {
    expect(setMode(createSession('l'), 'exam').mode).toBe('exam')
  })

  it('records passed checks without duplicates', () => {
    let session = createSession('l')
    session = passCheck(session, 'c1')
    session = passCheck(session, 'c1')
    expect(session.progress.checksPassed).toEqual(['c1'])
  })

  it('completes the lesson', () => {
    expect(completeLesson(createSession('l')).progress.completed).toBe(true)
  })
})
