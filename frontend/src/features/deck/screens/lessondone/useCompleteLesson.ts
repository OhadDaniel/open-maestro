import { useEffect, useRef } from 'react'
import { useCoursePosition } from '../../../course/useCoursePosition'
import { useProgressContext } from '../../../progress/ProgressContext'

export type FinishedLesson = {
  slug: string
  title: string
  lessonNumber: number
  lessonsInWeek: number
  weekNumber: number
  isLastOfWeek: boolean
}

export function useCompleteLesson(): FinishedLesson {
  const { completeLesson, advanceLessonPosition } = useProgressContext()
  const position = useCoursePosition()
  const snapshotRef = useRef<FinishedLesson>({
    slug: position.currentLessonSlug,
    title: position.currentLessonTitle,
    lessonNumber: position.currentLessonIndex + 1,
    lessonsInWeek: position.lessonsInWeek,
    weekNumber: position.currentWeekIndex + 1,
    isLastOfWeek: position.isLastLessonOfWeek,
  })
  const snapshot = snapshotRef.current
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current || snapshot.slug === '') {
      return
    }
    doneRef.current = true
    completeLesson(snapshot.slug)
    if (!snapshot.isLastOfWeek) {
      advanceLessonPosition()
    }
  }, [completeLesson, advanceLessonPosition, snapshot])

  return snapshot
}
