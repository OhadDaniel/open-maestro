import { useMemo } from 'react'
import { useProgressContext } from '../progress/ProgressContext'
import {
  COURSE_LEVEL_COUNT,
  WEEK_LESSON_COUNT,
  WEEK_LESSON_TITLES,
  WEEK_TITLES,
} from './course.constants'
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
    const currentWeekIndex = Math.min(state.currentWeekIndex, COURSE_LEVEL_COUNT - 1)
    const currentLessonIndex = Math.min(state.currentLessonIndex, WEEK_LESSON_COUNT - 1)
    const levelPct = Math.round((currentLessonIndex / WEEK_LESSON_COUNT) * 100)

    const weeks: WeekView[] = WEEK_TITLES.map((title, index) => {
      const status = statusFor(index, currentWeekIndex)
      const lessonsDone =
        status === 'done'
          ? WEEK_LESSON_COUNT
          : status === 'current'
            ? currentLessonIndex
            : 0
      return {
        index,
        title,
        lessonTitles: WEEK_LESSON_TITLES[index] ?? [],
        status,
        lessonsDone,
      } satisfies WeekView
    })

    return { currentWeekIndex, currentLessonIndex, levelPct, weeks }
  }, [state.currentWeekIndex, state.currentLessonIndex])
}
