import { BAKED_LESSON_SLUGS } from '../../content/samples/py101-catalog'
import { ACTIVE_COURSE } from './course.constants'

export type MappedLesson = { id: string; title: string }

export type MappedWeek = { id: string; title: string; lessons: readonly MappedLesson[] }

const BAKED_SLUG_SET = new Set<string>(BAKED_LESSON_SLUGS)

export const BAKED_WEEKS: readonly MappedWeek[] = ACTIVE_COURSE.weeks
  .map((week) => ({
    id: week.id,
    title: week.title,
    lessons: week.lessons.filter((lesson) => BAKED_SLUG_SET.has(lesson.id)),
  }))
  .filter((week) => week.lessons.length > 0)

export const BAKED_WEEK_COUNT = BAKED_WEEKS.length

export function lessonCountForWeek(weekIndex: number): number {
  return BAKED_WEEKS[weekIndex]?.lessons.length ?? 0
}

export function lessonAt(weekIndex: number, lessonIndex: number): MappedLesson | null {
  return BAKED_WEEKS[weekIndex]?.lessons[lessonIndex] ?? null
}

export function isLastLessonOfWeek(weekIndex: number, lessonIndex: number): boolean {
  const count = lessonCountForWeek(weekIndex)
  return count > 0 && lessonIndex === count - 1
}
