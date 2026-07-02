import { useEffect, useRef } from 'react'
import { useProgressContext } from '../../../progress/ProgressContext'
import { useViewedLesson } from '../../../lessonview/useViewedLesson'

export type FinishedLesson = {
  slug: string
  title: string
  lessonNumber: number
  lessonsInWeek: number
  weekNumber: number
  isFrontier: boolean
  isLastOfWeek: boolean
}

export function useCompleteLesson(): FinishedLesson {
  const { completeLesson, advanceLessonPosition } = useProgressContext()
  const viewed = useViewedLesson()
  const snapshotRef = useRef<FinishedLesson>({
    slug: viewed.slug,
    title: viewed.title,
    lessonNumber: viewed.lessonIndex + 1,
    lessonsInWeek: viewed.lessonsInWeek,
    weekNumber: viewed.weekIndex + 1,
    isFrontier: viewed.isFrontier,
    isLastOfWeek: viewed.isLastOfWeek,
  })
  const snapshot = snapshotRef.current
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current || snapshot.slug === '') {
      return
    }
    doneRef.current = true
    completeLesson(snapshot.slug)
    if (snapshot.isFrontier && !snapshot.isLastOfWeek) {
      advanceLessonPosition()
    }
  }, [completeLesson, advanceLessonPosition, snapshot])

  return snapshot
}
