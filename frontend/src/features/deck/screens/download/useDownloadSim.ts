import { useEffect, useState } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { DOWNLOAD_DURATION } from './download.constants'

type DownloadState = {
  percent: number
  done: boolean
}

export function useDownloadSim(): DownloadState {
  const [percent, setPercent] = useState(0)
  const [done, setDone] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setPercent(100)
      setDone(true)
      return
    }
    const tracker = { value: 0 }
    const animation = animate(tracker, {
      value: 100,
      duration: DOWNLOAD_DURATION,
      ease: EASE.inOutQuart,
      onUpdate: () => setPercent(tracker.value),
      onComplete: () => {
        setPercent(100)
        setDone(true)
      },
    })
    return () => {
      animation.pause()
    }
  }, [reduced])

  return { percent, done }
}
