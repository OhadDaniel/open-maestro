import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import type { TutorProvider } from '../../../../ai/provider'
import { MockTutorProvider } from '../../../../ai/mock-provider'
import { WebLlmProvider, isWebGpuAvailable, pickBestModel } from '../../../../ai/webllm-provider'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { DOWNLOAD_DURATION } from './download.constants'

type DownloadProgress = {
  percent: number
  done: boolean
}

export function useDownloadProgress(
  existing: TutorProvider | null,
  setProvider: (provider: TutorProvider) => void,
): DownloadProgress {
  const [percent, setPercent] = useState(existing !== null ? 100 : 0)
  const [done, setDone] = useState(existing !== null)
  const reduced = useReducedMotion()
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || existing !== null) {
      return
    }
    startedRef.current = true
    let active = true

    const finish = (provider: TutorProvider) => {
      if (!active) {
        return
      }
      setPercent(100)
      setDone(true)
      setProvider(provider)
    }

    if (reduced) {
      finish(new MockTutorProvider())
      return () => {
        active = false
      }
    }

    if (!isWebGpuAvailable()) {
      const tracker = { value: 0 }
      const animation = animate(tracker, {
        value: 100,
        duration: DOWNLOAD_DURATION,
        ease: EASE.inOutQuart,
        onUpdate: () => {
          if (active) {
            setPercent(tracker.value)
          }
        },
        onComplete: () => finish(new MockTutorProvider()),
      })
      return () => {
        active = false
        animation.pause()
      }
    }

    WebLlmProvider.create(pickBestModel(), (report) => {
      if (active) {
        setPercent(Math.max(1, Math.min(99, report.progress * 100)))
      }
    })
      .then(finish)
      .catch(() => finish(new MockTutorProvider()))

    return () => {
      active = false
    }
  }, [existing, setProvider, reduced])

  return { percent, done }
}
