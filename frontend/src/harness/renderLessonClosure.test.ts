import { describe, expect, it } from 'vitest'
import type { BakedLesson } from '../content/baked.types'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import { emptyProfile } from '../memory/learner-profile'
import { renderLessonClosure } from './renderLessonClosure'

const WELCOME_LESSON: BakedLesson = {
  ...WRITING_YOUR_FIRST_PROGRAM,
  lesson: {
    ...WRITING_YOUR_FIRST_PROGRAM.lesson,
    id: 'py101-w1-welcome',
    masteryOutcomes: [
      'Meet Maestro and understand how learning works here',
      'Type a line of Python in the editor and press Run',
      'Make the computer print your own words',
    ],
  },
  checks: [
    {
      id: 'py101-w1-welcome-first-run',
      prompt: 'Type print("Hello, PY101!") in the editor, press Run',
      acceptanceCriteria: [],
      passFeedback: "That's it — you just gave a computer an instruction and it obeyed. That's coding.",
      failFeedback: 'Look at the output panel',
    },
    {
      id: 'py101-w1-welcome-dream-print',
      prompt: 'Change the text so the computer prints YOUR dream',
      acceptanceCriteria: [],
      passFeedback: 'Your own dream, spoken by your own code. Remember this moment.',
      failFeedback: 'Keep the print("...") shape and only change the words',
    },
  ],
  celebration: {
    headline: 'The computer just spoke your words.',
    recap: 'You wrote your first real Python, ran it, and made the machine print your own dream.',
    unlocked: 'Next: Writing your first program.',
  },
}

const POWER_UPS_LESSON: BakedLesson = {
  ...WRITING_YOUR_FIRST_PROGRAM,
  lesson: {
    ...WRITING_YOUR_FIRST_PROGRAM.lesson,
    id: 'py101-w1-unlocking-print-power-ups',
    masteryOutcomes: [
      'Print multiple values using commas',
      'Understand that printing is always on a new line',
      'Print multiple text and numeric values using the + and * operators.',
    ],
  },
  checks: [
    {
      id: 'py101-w1-power-commas',
      prompt: 'Write one line that prints: Score: 100 — using a comma to combine the text and the number.',
      acceptanceCriteria: [],
      passFeedback: 'Exactly right — the comma joined text and a number in one line, and print added the space for you.',
      failFeedback: 'Check three things: one print, a comma between the two values.',
    },
    {
      id: 'py101-w1-power-plus-star',
      prompt: 'Write two lines: first print a divider made of ten = signs using *, then print the word Welcome joined from "Wel" + "come".',
      acceptanceCriteria: [],
      passFeedback: 'Beautiful — * built the divider, + glued the pieces, and each print took its own line.',
      failFeedback: 'Almost — make sure the = is in quotes times 10.',
    },
  ],
  celebration: {
    headline: 'print() just leveled up in your hands.',
    recap: 'You combined text and numbers with commas, saw why every print takes its own line, glued strings with +, and built repeats and dividers with *.',
    unlocked: 'Next: variables.',
  },
}

const PRINT_SENTENCE = "That's print() — you told the computer exactly what to say, and it said it."

describe('renderLessonClosure', () => {
  it('welcome closure uses print sentence', () => {
    const text = renderLessonClosure(WELCOME_LESSON, emptyProfile())
    expect(text).toContain(PRINT_SENTENCE)
    expect(text).toContain("When you're ready, wrap up below.")
    expect(text).toContain("Remember this moment")
  })

  it('writing-your-first-program closure uses print sentence', () => {
    const text = renderLessonClosure(WRITING_YOUR_FIRST_PROGRAM, emptyProfile())
    expect(text).toContain(PRINT_SENTENCE)
    expect(text).toContain("When you're ready, wrap up below.")
  })

  it('power-ups closure does NOT use generic print sentence', () => {
    const text = renderLessonClosure(POWER_UPS_LESSON, emptyProfile())
    expect(text).not.toContain(PRINT_SENTENCE)
    expect(text).toContain("When you're ready, wrap up below.")
    // skill sentence comes from celebration.recap first sentence (or fallback)
    expect(text).toMatch(/commas|power-ups|glued|divider/)
  })

  it('power-ups closure uses checks[1] passFeedback (the +/* check) for last outcome', () => {
    const text = renderLessonClosure(POWER_UPS_LESSON, emptyProfile())
    expect(text).toContain('Beautiful')
  })

  it('closure with evidence quotes first output line', () => {
    const evidence = { code: 'print("Hello")', output: 'Hello\nWorld', quotedStrings: ['Hello'] }
    const text = renderLessonClosure(WRITING_YOUR_FIRST_PROGRAM, emptyProfile(), evidence)
    expect(text).toContain('There it is — your code printed: "Hello".')
  })

  it('closure without evidence omits the quote line', () => {
    const text = renderLessonClosure(WRITING_YOUR_FIRST_PROGRAM, emptyProfile())
    expect(text).not.toContain('There it is')
  })
})
