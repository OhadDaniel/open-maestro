import { useEffect, useRef } from 'react'
import { useProgressContext } from '../../../progress/ProgressContext'
import { LESSON_SLUG } from '../../../lessonchat/lessonchat.constants'

export function useCompleteLesson() {
  const { completeLesson, advanceLessonPosition } = useProgressContext()
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) {
      return
    }
    doneRef.current = true
    completeLesson(LESSON_SLUG)
    advanceLessonPosition()
  }, [completeLesson, advanceLessonPosition])
}
