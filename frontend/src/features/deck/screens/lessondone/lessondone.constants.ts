export const LESSON_DONE_COPY = {
  title: 'Lesson complete',
  continue: 'Next lesson',
  backToWeek: 'Back to week',
} as const

export function lessonDoneSubtitle(title: string, lessonNumber: number, lessonsInWeek: number): string {
  return `${title} · Lesson ${lessonNumber} of ${lessonsInWeek}`
}

export function finishWeekLabel(weekNumber: number): string {
  return `Finish Week ${weekNumber}`
}

export const CHECK_POP_DURATION = 640
export const SPARK_COUNT = 8
export const SPARK_DELAY = 640
export const TYPEWRITER_START = 1100
export const TYPEWRITER_CPS = 17
