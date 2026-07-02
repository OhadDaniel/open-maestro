import type { ProgressState } from './progress.types'

export const PROGRESS_STORAGE_KEY = 'open-maestro.progress.v2'

export const INITIAL_PROGRESS_STATE: ProgressState = {
  firstRunDone: false,
  completedLessonIds: [],
  completedWeekIds: [],
  currentWeekIndex: 0,
  currentLessonIndex: 0,
}
