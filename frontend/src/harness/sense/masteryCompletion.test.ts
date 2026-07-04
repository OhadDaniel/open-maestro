import { describe, expect, it } from 'vitest'
import type { BakedLesson } from '../../content/baked.types'
import { WRITING_YOUR_FIRST_PROGRAM } from '../../content/samples/writing-your-first-program'
import { createSession, masterOutcome } from '../../tutor/session'
import { evaluateMasteryTurn } from './masteryCompletion'

// Minimal 3-outcome welcome lesson for welcome-specific tests (ID matches actual JSON)
const WELCOME_LESSON: BakedLesson = {
  ...WRITING_YOUR_FIRST_PROGRAM,
  lesson: {
    ...WRITING_YOUR_FIRST_PROGRAM.lesson,
    id: 'py101-w1-welcome',
    masteryOutcomes: [
      'Understand how learning works in Maestro',
      'Print a greeting using print()',
      'Print your own message using print()',
    ],
  },
}

function runMsg(code: string, output: string): string {
  return `I ran this code:\n\n${code}\n\nOutput:\n${output}`
}

describe('evaluateMasteryTurn', () => {
  // Test 0: engagement reply on welcome outcome 0 → claimed 0
  it('"yes" on welcome lesson outcome 0 → claimed outcome 0', () => {
    const session = createSession('py101-w1-welcome')
    const result = evaluateMasteryTurn({ baked: WELCOME_LESSON, session, userMessage: 'yes ready' })
    expect(result?.kind).toBe('claimed')
    if (result?.kind === 'claimed') {
      expect(result.outcomeIndex).toBe(0)
    }
  })

  // Test 1: arbitrary (non-canned) string on welcome → lesson-complete when 0 already mastered
  it('custom print text on welcome lesson (outcome 0 mastered) → lesson-complete', () => {
    const session = masterOutcome(createSession('py101-w1-welcome'), 0)
    const result = evaluateMasteryTurn({
      baked: WELCOME_LESSON,
      session,
      userMessage: runMsg('print("My dream is to build an app")', 'My dream is to build an app'),
      runResult: { ok: true, output: 'My dream is to build an app' },
    })
    expect(result?.kind).toBe('lesson-complete')
    if (result?.kind === 'lesson-complete') {
      expect(result.evidence?.quotedStrings).toContain('My dream is to build an app')
    }
  })

  // Test 2: canned "Hello, PY101!" on welcome → demonstrated outcome 1 only (not complete)
  it('canned Hello, PY101! on welcome lesson → demonstrated outcome 1, not lesson-complete', () => {
    const session = masterOutcome(createSession('py101-w1-welcome'), 0)
    const result = evaluateMasteryTurn({
      baked: WELCOME_LESSON,
      session,
      userMessage: runMsg('print("Hello, PY101!")', 'Hello, PY101!'),
      runResult: { ok: true, output: 'Hello, PY101!' },
    })
    expect(result?.kind).toBe('demonstrated')
    if (result?.kind === 'demonstrated') {
      expect(result.outcomeIndex).toBe(1)
    }
  })

  // Test 3: "continue" on last outcome → lesson-complete
  it('"continue" on last practicing outcome → lesson-complete', () => {
    // 2-outcome lesson; outcome 0 already mastered, outcome 1 is the last
    const session = masterOutcome(
      createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id),
      0,
    )
    const result = evaluateMasteryTurn({
      baked: WRITING_YOUR_FIRST_PROGRAM,
      session,
      userMessage: 'continue',
    })
    expect(result?.kind).toBe('lesson-complete')
  })

  // Test 4: "continue" on first outcome (not last) → claimed only
  it('"continue" on first of two outcomes → claimed, not lesson-complete', () => {
    // 2-outcome lesson; nothing mastered yet
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const result = evaluateMasteryTurn({
      baked: WRITING_YOUR_FIRST_PROGRAM,
      session,
      userMessage: 'continue',
    })
    expect(result?.kind).toBe('claimed')
    if (result?.kind === 'claimed') {
      expect(result.outcomeIndex).toBe(0)
    }
  })

  // Test 5: plain chat message without a run → null
  it('plain question without run → null', () => {
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const result = evaluateMasteryTurn({
      baked: WRITING_YOUR_FIRST_PROGRAM,
      session,
      userMessage: 'what does print do?',
    })
    expect(result).toBeNull()
  })

  // Bonus: print on 2nd outcome (last) → lesson-complete
  it('print run on last practicing outcome (general lesson) → lesson-complete', () => {
    const session = masterOutcome(
      createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id),
      0,
    )
    const result = evaluateMasteryTurn({
      baked: WRITING_YOUR_FIRST_PROGRAM,
      session,
      userMessage: runMsg('print("Hello, world!")', 'Hello, world!'),
      runResult: { ok: true, output: 'Hello, world!' },
    })
    expect(result?.kind).toBe('lesson-complete')
    if (result?.kind === 'lesson-complete') {
      expect(result.evidence?.quotedStrings).toContain('Hello, world!')
    }
  })

    // Bonus: print on 1st of 2 outcomes → demonstrated (not complete)
  it('print run on first practicing outcome (general lesson) → demonstrated outcome 0', () => {
    const session = createSession(WRITING_YOUR_FIRST_PROGRAM.lesson.id)
    const result = evaluateMasteryTurn({
      baked: WRITING_YOUR_FIRST_PROGRAM,
      session,
      userMessage: runMsg('print("Hello, world!")', 'Hello, world!'),
      runResult: { ok: true, output: 'Hello, world!' },
    })
    expect(result?.kind).toBe('demonstrated')
    if (result?.kind === 'demonstrated') {
      expect(result.outcomeIndex).toBe(0)
    }
  })
})

// Mock for unlocking-print-power-ups (3 outcomes: commas, newlines, +/*)
const POWER_UPS_LESSON: BakedLesson = {
  ...WRITING_YOUR_FIRST_PROGRAM,
  lesson: {
    ...WRITING_YOUR_FIRST_PROGRAM.lesson,
    id: 'py101-w1-unlocking-print-power-ups',
    masteryOutcomes: [
      'Use commas in print() to combine values',
      'Use multiple print() calls to create new lines',
      'Use + and * to build strings',
    ],
  },
}

describe('evaluateMasteryTurn — unlocking-print-power-ups', () => {
  it('comma print demonstrates outcome 0', () => {
    const session = createSession('py101-w1-unlocking-print-power-ups')
    const result = evaluateMasteryTurn({
      baked: POWER_UPS_LESSON,
      session,
      userMessage: runMsg('print("Hello", "world")', 'Hello world'),
      runResult: { ok: true, output: 'Hello world' },
    })
    expect(result?.kind).toBe('demonstrated')
    if (result?.kind === 'demonstrated') {
      expect(result.outcomeIndex).toBe(0)
    }
  })

  it('single print without comma does not demonstrate outcome 0', () => {
    const session = createSession('py101-w1-unlocking-print-power-ups')
    const result = evaluateMasteryTurn({
      baked: POWER_UPS_LESSON,
      session,
      userMessage: runMsg('print("hello")', 'hello'),
      runResult: { ok: true, output: 'hello' },
    })
    expect(result).toBeNull()
  })

  it('two print calls with two output lines demonstrates outcome 1', () => {
    const session = masterOutcome(createSession('py101-w1-unlocking-print-power-ups'), 0)
    const result = evaluateMasteryTurn({
      baked: POWER_UPS_LESSON,
      session,
      userMessage: runMsg('print("line1")\nprint("line2")', 'line1\nline2'),
      runResult: { ok: true, output: 'line1\nline2' },
    })
    expect(result?.kind).toBe('demonstrated')
    if (result?.kind === 'demonstrated') {
      expect(result.outcomeIndex).toBe(1)
    }
  })

  it('string repetition on last outcome → lesson-complete', () => {
    const session = masterOutcome(
      masterOutcome(createSession('py101-w1-unlocking-print-power-ups'), 0),
      1,
    )
    const result = evaluateMasteryTurn({
      baked: POWER_UPS_LESSON,
      session,
      userMessage: runMsg('print("=" * 10)', '=========='),
      runResult: { ok: true, output: '==========' },
    })
    expect(result?.kind).toBe('lesson-complete')
  })
})
