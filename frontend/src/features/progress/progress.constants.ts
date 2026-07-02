import type { ProgressState } from './progress.types'

export const PROGRESS_STORAGE_KEY = 'open-maestro.progress.v1'

export const INITIAL_PROGRESS_STATE: ProgressState = {
  firstRunDone: false,
  completedLessonIds: [],
  completedWeekIds: [],
  currentWeekIndex: 2,
  currentLessonIndex: 3,
}

export const SEED_RETURNING_STATE: ProgressState = {
  firstRunDone: true,
  completedLessonIds: [
    'welcome-to-py101',
    'writing-your-first-program',
    'unlocking-print-power-ups',
    'introduction-to-variables',
    'working-with-text',
    'working-with-numbers',
    'modeling-real-world-calculations',
    'review-writing-your-first-program',
    'division-modes',
    'modulo-in-practice',
    'rounding-and-money-format',
    'checking-the-facts',
    'getting-input-from-users',
    'meet-the-traceback',
    'challenge-core-foundations',
  ],
  completedWeekIds: ['py101-w1', 'py101-w2'],
  currentWeekIndex: 2,
  currentLessonIndex: 3,
}
