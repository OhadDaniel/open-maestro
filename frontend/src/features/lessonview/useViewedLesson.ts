import { isLastLessonOfWeek, lessonAt, lessonCountForWeek } from '../course/course-map'
import { useCoursePosition } from '../course/useCoursePosition'
import { useLessonViewContext } from './LessonViewContext'

export type ViewedLessonInfo = {
  weekIndex: number
  lessonIndex: number
  slug: string
  title: string
  lessonsInWeek: number
  isFrontier: boolean
  isLastOfWeek: boolean
}

export function useViewedLesson(): ViewedLessonInfo {
  const { viewed } = useLessonViewContext()
  const { currentWeekIndex, currentLessonIndex } = useCoursePosition()
  const weekIndex = viewed?.weekIndex ?? currentWeekIndex
  const lessonIndex = viewed?.lessonIndex ?? currentLessonIndex
  const lesson = lessonAt(weekIndex, lessonIndex)

  return {
    weekIndex,
    lessonIndex,
    slug: lesson?.id ?? '',
    title: lesson?.title ?? '',
    lessonsInWeek: lessonCountForWeek(weekIndex),
    isFrontier: weekIndex === currentWeekIndex && lessonIndex === currentLessonIndex,
    isLastOfWeek: isLastLessonOfWeek(weekIndex, lessonIndex),
  }
}
