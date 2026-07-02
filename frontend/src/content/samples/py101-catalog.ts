import type { DegreeCatalog } from '../catalog.types'

export const AI_ENGINEERING_CATALOG: DegreeCatalog = {
  id: 'ai-engineering',
  title: 'AI Engineering',
  courses: [
    {
      id: 'py101',
      code: 'PY101',
      title: 'Introduction to Python programming',
      weeks: [
        {
          id: 'py101-w1',
          title: 'Writing your first program',
          lessons: [
            { id: 'welcome-to-py101', title: 'Welcome to PY101!' },
            { id: 'writing-your-first-program', title: 'Writing your first program' },
            { id: 'unlocking-print-power-ups', title: 'Unlocking print() power-ups' },
            { id: 'introduction-to-variables', title: 'Introduction to variables' },
            { id: 'working-with-text', title: 'Working with text' },
            { id: 'working-with-numbers', title: 'Working with numbers' },
            { id: 'modeling-real-world-calculations', title: 'Modeling real-world calculations' },
            { id: 'review-writing-your-first-program', title: 'Review: writing your first program' },
          ],
        },
        {
          id: 'py101-w2',
          title: 'Core foundations',
          lessons: [
            { id: 'division-modes', title: 'Division modes: / vs // with quotient and remainder' },
            { id: 'modulo-in-practice', title: 'Modulo in practice: parity, cycles, positions' },
            { id: 'rounding-and-money-format', title: 'Rounding, and money format' },
            { id: 'checking-the-facts', title: 'Checking the facts' },
            { id: 'getting-input-from-users', title: 'Talking to your program: getting input from users' },
            { id: 'meet-the-traceback', title: 'Python errors: meet the traceback' },
            { id: 'challenge-core-foundations', title: 'Challenge: core foundations' },
            { id: 'functions-i', title: 'Functions I: why, define, and call' },
            { id: 'functions-ii', title: 'Functions II: inside the function' },
            { id: 'functions-iii', title: 'Functions III: return vs print and early return' },
            { id: 'scope-and-local-variables', title: 'Scope and local variables' },
            { id: 'review-core-foundations', title: 'Review: core foundations' },
          ],
        },
        {
          id: 'py101-w3',
          title: 'Decisions and loops',
          lessons: [{ id: 'py101-w3-coming-soon', title: 'Coming soon' }],
        },
        {
          id: 'py101-w4',
          title: 'Introduction to Python summary',
          lessons: [{ id: 'py101-w4-coming-soon', title: 'Coming soon' }],
        },
      ],
    },
  ],
}

export const BAKED_LESSON_SLUGS = [
  'welcome-to-py101',
  'writing-your-first-program',
  'unlocking-print-power-ups',
  'working-with-text',
  'working-with-numbers',
  'modeling-real-world-calculations',
  'division-modes',
  'modulo-in-practice',
  'rounding-and-money-format',
  'checking-the-facts',
  'getting-input-from-users',
  'meet-the-traceback',
  'functions-i',
  'functions-ii',
  'functions-iii',
  'scope-and-local-variables',
] as const
