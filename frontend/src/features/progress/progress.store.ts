import { z } from 'zod'
import { INITIAL_PROGRESS_STATE, PROGRESS_STORAGE_KEY } from './progress.constants'
import type { ProgressState } from './progress.types'

const progressSchema = z
  .object({
    firstRunDone: z.boolean(),
    completedLessonIds: z.array(z.string()),
    completedWeekIds: z.array(z.string()),
    currentWeekIndex: z.number().int().min(0),
    currentLessonIndex: z.number().int().min(0),
  })
  .strict()

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (raw === null) {
      return INITIAL_PROGRESS_STATE
    }
    const parsed = progressSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : INITIAL_PROGRESS_STATE
  } catch {
    return INITIAL_PROGRESS_STATE
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}
