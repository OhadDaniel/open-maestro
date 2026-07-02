import { RESUME_LESSON_TITLE } from '../../../course/course.constants'
import { useCoursePosition } from '../../../course/useCoursePosition'

type HomeCurrent = {
  currentWeekIndex: number
  levelPct: number
  resumeTitle: string
  resumeMeta: string
  completedConstellations: number
}

export function useHomeCurrent(): HomeCurrent {
  const { currentWeekIndex, currentLessonIndex, levelPct } = useCoursePosition()

  return {
    currentWeekIndex,
    levelPct,
    resumeTitle: RESUME_LESSON_TITLE,
    resumeMeta: `PY101 · Lesson ${currentLessonIndex + 1}`,
    completedConstellations: currentWeekIndex,
  }
}
