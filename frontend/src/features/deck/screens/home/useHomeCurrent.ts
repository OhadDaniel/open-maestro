import { useCoursePosition } from '../../../course/useCoursePosition'

type HomeCurrent = {
  currentWeekIndex: number
  levelPct: number
  resumeTitle: string
  resumeMeta: string
  completedConstellations: number
}

const RESUME_FALLBACK_TITLE = 'Your next lesson'

export function useHomeCurrent(): HomeCurrent {
  const { currentWeekIndex, currentLessonIndex, currentLessonTitle, levelPct } = useCoursePosition()

  return {
    currentWeekIndex,
    levelPct,
    resumeTitle: currentLessonTitle === '' ? RESUME_FALLBACK_TITLE : currentLessonTitle,
    resumeMeta: `PY101 · Week ${currentWeekIndex + 1} · Lesson ${currentLessonIndex + 1}`,
    completedConstellations: currentWeekIndex,
  }
}
