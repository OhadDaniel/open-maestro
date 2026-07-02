import { useCallback, useState } from 'react'
import { loadProgress, saveProgress } from './progress.store'
import type { ProgressState } from './progress.types'

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => loadProgress())

  const persist = useCallback((next: ProgressState) => {
    saveProgress(next)
    setState(next)
  }, [])

  const markFirstRunDone = useCallback(() => {
    setState((current) => {
      if (current.firstRunDone) {
        return current
      }
      const next = { ...current, firstRunDone: true }
      saveProgress(next)
      return next
    })
  }, [])

  const completeLesson = useCallback((lessonId: string) => {
    setState((current) => {
      if (current.completedLessonIds.includes(lessonId)) {
        return current
      }
      const next: ProgressState = {
        ...current,
        completedLessonIds: [...current.completedLessonIds, lessonId],
      }
      saveProgress(next)
      return next
    })
  }, [])

  const completeWeek = useCallback((weekId: string) => {
    setState((current) => {
      if (current.completedWeekIds.includes(weekId)) {
        return current
      }
      const next: ProgressState = {
        ...current,
        completedWeekIds: [...current.completedWeekIds, weekId],
      }
      saveProgress(next)
      return next
    })
  }, [])

  return { state, persist, markFirstRunDone, completeLesson, completeWeek }
}
