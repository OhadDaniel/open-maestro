import { useMemo } from 'react'
import { useProgressContext } from '../progress/ProgressContext'
import {
  BAKED_WEEKS,
  BAKED_WEEK_COUNT,
  isLastLessonOfWeek,
  lessonAt,
  lessonCountForWeek,
} from './course-map'
import type { CoursePosition, WeekStatus, WeekView } from './course.types'

function statusFor(index: number, current: number): WeekStatus {
  if (index < current) {
    return 'done'
  }
  if (index === current) {
    return 'current'
  }
  return 'locked'
}

export function useCoursePosition(): CoursePosition {
  const { state } = useProgressContext()

  return useMemo(() => {
    const allWeeksCleared = state.currentWeekIndex >= BAKED_WEEK_COUNT
    const currentWeekIndex = Math.min(state.currentWeekIndex, Math.max(BAKED_WEEK_COUNT - 1, 0))
    const lessonsInWeek = lessonCountForWeek(currentWeekIndex)
    const currentLessonIndex = Math.min(state.currentLessonIndex, Math.max(lessonsInWeek - 1, 0))
    const levelPct = lessonsInWeek === 0 ? 0 : Math.round((currentLessonIndex / lessonsInWeek) * 100)
    const lesson = lessonAt(currentWeekIndex, currentLessonIndex)
    const activeWeek = allWeeksCleared ? BAKED_WEEK_COUNT : currentWeekIndex

    const weeks: WeekView[] = BAKED_WEEKS.map((week, index) => {
      const status = statusFor(index, activeWeek)
      const lessonsDone =
        status === 'done'
          ? week.lessons.length
          : status === 'current'
            ? currentLessonIndex
            : 0
      return {
        index,
        title: week.title,
        lessonTitles: week.lessons.map((entry) => entry.title),
        status,
        lessonsDone,
      } satisfies WeekView
    })

    return {
      currentWeekIndex,
      currentLessonIndex,
      currentWeekId: BAKED_WEEKS[currentWeekIndex]?.id ?? '',
      currentLessonSlug: lesson?.id ?? '',
      currentLessonTitle: lesson?.title ?? '',
      lessonsInWeek,
      isLastLessonOfWeek: isLastLessonOfWeek(currentWeekIndex, currentLessonIndex),
      allWeeksCleared,
      levelPct,
      weeks,
    }
  }, [state.currentWeekIndex, state.currentLessonIndex])
}
