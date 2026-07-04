import { describe, expect, it } from 'vitest'
import { WRITING_YOUR_FIRST_PROGRAM } from '../../content/samples/writing-your-first-program'
import type { TutorMode, TutorSession } from '../../content/session.types'
import { createSession } from '../../tutor/session'
import { EMPTY_MASTERY, MAX_TURNS_PER_OUTCOME, NEUTRAL_AFFECT, NO_MISCONCEPTION, TURN_BUDGET_BUFFER } from '../constants'
import type { AffectSignal, MasterySignal } from '../types'
import { affectObserver } from '../sense/affectObserver'
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
  userMessage: '',
}

describe('controller (slice 1)', () => {
  it('uses the mode default move', () => {
    expect(controller({ ...base, session: sessionWith('explain') }).action).toBe('explain')
    expect(controller({ ...base, session: sessionWith('practice') }).action).toBe('quiz')
    expect(controller({ ...base, session: sessionWith('challenge') }).action).toBe('hint')
    expect(controller({ ...base, session: sessionWith('exam') }).action).toBe('quiz')
  })

  it('wraps lesson when the turn budget is reached (anti-loop)', () => {
    const budget = lesson.lesson.masteryOutcomes.length * MAX_TURNS_PER_OUTCOME + TURN_BUDGET_BUFFER
    expect(controller({ ...base, session: sessionWith('explain'), turnIndex: budget }).action).toBe('wrap-lesson')
  })

  it('offers wrap when all outcomes are mastered (first time)', () => {
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_outcome, index) => ({
        id: String(index),
        status: 'mastered',
      })),
    }
    expect(controller({ ...base, session: sessionWith('explain'), mastery }).action).toBe('offer-wrap')
  })

  it('wraps lesson when all mastered, wrap already offered, and user agrees', () => {
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_outcome, index) => ({
        id: String(index),
        status: 'mastered',
      })),
    }
    const session = { ...sessionWith('explain'), progress: { ...sessionWith('explain').progress, wrapOffered: true } }
    expect(controller({ ...base, session, mastery, userMessage: 'yes please wrap it up' }).action).toBe('wrap-lesson')
  })

  it('declines wrap and resumes normal move when user says no', () => {
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_outcome, index) => ({
        id: String(index),
        status: 'mastered',
      })),
    }
    const session = { ...sessionWith('explain'), progress: { ...sessionWith('explain').progress, wrapOffered: true } }
    const move = controller({ ...base, session, mastery, userMessage: 'no, more practice please' })
    expect(move.action).not.toBe('offer-wrap')
    expect(move.action).not.toBe('wrap-lesson')
    expect(move.reason).toBe('wrap-declined')
  })

  it('does not offer-wrap again when wrapDeclined is true', () => {
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_outcome, index) => ({
        id: String(index),
        status: 'mastered',
      })),
    }
    const session = {
      ...sessionWith('explain'),
      progress: { ...sessionWith('explain').progress, wrapOffered: true, wrapDeclined: true },
    }
    const move = controller({ ...base, session, mastery })
    expect(move.action).not.toBe('offer-wrap')
  })

  it('returns advance with confident-claim reason when student is confident and there is a practicing outcome', () => {
    const confident: AffectSignal = { state: 'confident', confidence: 0.8, cues: [] }
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_, index) => ({
        id: String(index),
        status: index === 0 ? ('practicing' as const) : ('unseen' as const),
      })),
    }
    const move = controller({ ...base, session: sessionWith('explain'), affect: confident, mastery })
    expect(move.action).toBe('advance')
    expect(move.reason).toBe('confident-claim')
  })

  it('"i understand it well lets move on" triggers advance with next outcome in directive', () => {
    const affect = affectObserver('i understand it well lets move on', [])
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_, index) => ({
        id: String(index),
        status: index === 0 ? 'practicing' : ('unseen' as const),
      })),
    }
    const move = controller({ ...base, session: sessionWith('explain'), affect, mastery })
    expect(move.action).toBe('advance')
    expect(move.rules.join(' ')).toContain('Next outcome:')
    expect(move.rules.join(' ')).toContain(lesson.lesson.masteryOutcomes[1])
  })

  it('advance directive contains the next unmastered outcome text', () => {
    const confident: AffectSignal = { state: 'confident', confidence: 0.8, cues: [] }
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_, index) => ({
        id: String(index),
        status: index === 0 ? 'practicing' : 'unseen',
      })),
    }
    const move = controller({ ...base, session: sessionWith('explain'), affect: confident, mastery })
    expect(move.action).toBe('advance')
    const secondOutcome = lesson.lesson.masteryOutcomes[1]
    expect(move.rules.join(' ')).toContain(secondOutcome)
    expect(move.rules.join(' ')).toContain('Next outcome:')
  })

  it('wrap-lesson rules include the verbatim summaryBullets instruction', () => {
    const mastery: MasterySignal = {
      skills: lesson.lesson.masteryOutcomes.map((_outcome, index) => ({
        id: String(index),
        status: 'mastered',
      })),
    }
    const session = { ...sessionWith('explain'), progress: { ...sessionWith('explain').progress, wrapOffered: true } }
    const move = controller({ ...base, session, mastery, userMessage: 'sure' })
    expect(move.action).toBe('wrap-lesson')
    expect(move.rules.join(' ')).toContain('summaryBullets')
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

describe('controller — P0-1 early advance triggers', () => {
  const practicingMastery: MasterySignal = {
    skills: lesson.lesson.masteryOutcomes.map((_, index) => ({
      id: String(index),
      status: index === 0 ? ('practicing' as const) : ('unseen' as const),
    })),
  }

  it('advances on explicit "continue" before affect check', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'ok continue',
    })
    expect(move.action).toBe('advance')
    expect(move.reason).toBe('explicit-advance')
  })

  it('advances on "I understand" before affect check', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'I understand it now',
    })
    expect(move.action).toBe('advance')
    expect(move.reason).toBe('explicit-advance')
  })

  it('advances on "got it" before affect check', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'got it, thanks',
    })
    expect(move.action).toBe('advance')
    expect(move.reason).toBe('explicit-advance')
  })

  it('advances on successful run with output', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'I ran this code',
      runResult: { ok: true, output: 'Hello, world!\n' },
    })
    expect(move.action).toBe('advance')
    expect(move.reason).toBe('run-success')
  })

  it('does NOT advance on failed run', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'got an error',
      runResult: { ok: false, output: 'SyntaxError: invalid syntax' },
    })
    expect(move.action).not.toBe('advance')
  })

  it('advances via turn-cap at MAX_TURNS_PER_OUTCOME', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'still confused',
      turnsOnCurrentOutcome: MAX_TURNS_PER_OUTCOME,
    })
    expect(move.action).toBe('advance')
    expect(move.reason).toBe('turn-cap')
  })

  it('does NOT advance via turn-cap below MAX_TURNS_PER_OUTCOME', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'still confused',
      turnsOnCurrentOutcome: MAX_TURNS_PER_OUTCOME - 1,
    })
    expect(move.action).not.toBe('advance')
  })

  it('advance rules include next outcome text', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: 'next',
    })
    expect(move.action).toBe('advance')
    expect(move.rules.join(' ')).toContain('Next outcome:')
    expect(move.rules.join(' ')).toContain(lesson.lesson.masteryOutcomes[1])
  })

  it('does NOT fire explicit advance when no outcome is practicing', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: EMPTY_MASTERY,
      userMessage: 'continue',
    })
    expect(move.action).not.toBe('advance')
  })

  it('mode-default move includes step context rule', () => {
    const move = controller({
      ...base,
      session: sessionWith('explain'),
      mastery: practicingMastery,
      userMessage: '',
    })
    expect(move.action).toBe('explain')
    expect(move.rules.join(' ')).toContain('Current step')
    expect(move.rules.join(' ')).toContain(lesson.lesson.masteryOutcomes[0])
  })
})
