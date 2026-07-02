import { useEffect, useRef } from 'react'
import { BAKED_WEEKS } from '../../../course/course-map'
import { useProgressContext } from '../../../progress/ProgressContext'

export function useClearWeek(weekIndex: number) {
  const { clearWeek } = useProgressContext()
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) {
      return
    }
    doneRef.current = true
    const week = BAKED_WEEKS[weekIndex]
    if (week !== undefined) {
      clearWeek(week.id)
    }
  }, [clearWeek, weekIndex])
}
