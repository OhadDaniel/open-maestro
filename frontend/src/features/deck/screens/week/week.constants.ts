import { RESUME_LESSON_TITLE } from '../../../course/course.constants'

export const WEEK_COPY = {
  breadcrumbRoot: 'AI Engineering',
  courseMeta: 'PY101 · Python fundamentals',
  upNextLessonTitle: RESUME_LESSON_TITLE,
  continue: 'Continue',
  railKicker: 'The ridge',
  railGoal: 'to reach the next camp',
  streakLabel: 'on your streak',
  tutorTitle: 'Tutor ready',
  tutorSub: 'on your device',
} as const

export function weekSubtitle(weekIndex: number, levelCount: number): string {
  return `${WEEK_COPY.courseMeta} · Level ${weekIndex + 1} of ${levelCount}`
}

export function lockedSub(weekIndex: number): string {
  return `Unlocks after Week ${weekIndex}`
}

export function progressSub(lessonsDone: number, total: number): string {
  return `In progress · ${lessonsDone} of ${total} done`
}
