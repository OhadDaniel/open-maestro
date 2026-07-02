import { useEffect, useRef } from 'react'
import { ACTIVE_COURSE } from '../../../course/course.constants'
import { useProgressContext } from '../../../progress/ProgressContext'

export function useClearWeek(weekIndex: number) {
  const { clearWeek } = useProgressContext()
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) {
      return
    }
    doneRef.current = true
    const week = ACTIVE_COURSE.weeks[weekIndex]
    if (week !== undefined) {
      clearWeek(week.id)
    }
  }, [clearWeek, weekIndex])
}
