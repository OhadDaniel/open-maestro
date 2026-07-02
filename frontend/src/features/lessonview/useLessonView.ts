import { useCallback, useState } from 'react'

export type ViewedLesson = { weekIndex: number; lessonIndex: number }

export function useLessonView() {
  const [viewed, setViewed] = useState<ViewedLesson | null>(null)

  const openLessonAt = useCallback((weekIndex: number, lessonIndex: number) => {
    setViewed({ weekIndex, lessonIndex })
  }, [])

  const clearView = useCallback(() => setViewed(null), [])

  return { viewed, openLessonAt, clearView }
}
