import { describe, expect, it } from 'vitest'
import { WRITING_YOUR_FIRST_PROGRAM } from '../../content/samples/writing-your-first-program'
import type { TutorMode, TutorSession } from '../../content/session.types'
import { createSession } from '../../tutor/session'
import { EMPTY_MASTERY, NEUTRAL_AFFECT, NO_MISCONCEPTION, TURN_BUDGET_BUFFER, TURNS_PER_OUTCOME } from '../constants'
import type { AffectSignal, MasterySignal } from '../types'
import { controller } from './controller'

const lesson = WRITING_YOUR_FIRST_PROGRAM

function sessionWith(mode: TutorMode): TutorSession {
  return { ...createSession(lesson.lesson.id), mode }
}

const base = {
  lesson,
  affect: NEUTRAL_AFFECT,
  mastery: EMPTY_MASTERY,
  misconception: NO_MISCONCEPTION,
  turnIndex: 0,
}

describe('controller (slice 1)', () => {
  it('uses the mode default move', () => {
    expect(controller({ ...base, session: sessionWith('explain') }).action).toBe('explain')
    expect(controller({ ...base, session: sessionWith('practice') }).action).toBe('quiz')
    expect(controller({ ...base, session: sessionWith('challenge') }).action).toBe('hint')
    expect(controller({ ...base, session: sessionWith('exam') }).action).toBe('quiz')
  })

  it('closes when the turn budget is reached (anti-loop)', () => {
    const budget = lesson.lesson.masteryOutcomes.length * TURNS_PER_OUTCOME + TURN_BUDGET_BUFFER
    expect(controller({ ...base, session: sessionWith('explain'), turnIndex: budget }).action).toBe('close')
  })

  it('closes when all outcomes are mastered', () => {
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_outcome, index) => ({
        id: String(index),
        status: 'mastered',
      })),
    }
    expect(controller({ ...base, session: sessionWith('explain'), mastery }).action).toBe('close')
  })

  it('acts on strong affect', () => {
    const frustrated: AffectSignal = { state: 'frustrated', confidence: 0.8, cues: [] }
    expect(controller({ ...base, session: sessionWith('explain'), affect: frustrated }).action).toBe('encourage')
    const confused: AffectSignal = { state: 'confused', confidence: 0.8, cues: [] }
    expect(controller({ ...base, session: sessionWith('practice'), affect: confused }).action).toBe('explain')
  })

  it('ignores weak affect', () => {
    const weak: AffectSignal = { state: 'frustrated', confidence: 0.3, cues: [] }
    expect(controller({ ...base, session: sessionWith('explain'), affect: weak }).action).toBe('explain')
  })

  it('addresses a matched misconception with remediation', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      misconception: { matched: true, id: 'm1', remediation: 'Remind them quotes make a string.' },
    })
    expect(move.action).toBe('explain')
    expect(move.rules.join(' ')).toContain('quotes make a string')
  })
})
