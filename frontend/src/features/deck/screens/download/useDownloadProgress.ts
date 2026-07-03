import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import type { TutorProvider } from '../../../../ai/provider'
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

    const finish = (provider: TutorProvider | null) => {
      setPercent(100)
      setDone(true)
      if (provider !== null) {
        setProvider(provider)
      }
    }

    if (reduced) {
      finish(null)
      return
    }

    if (!isWebGpuAvailable()) {
      const tracker = { value: 0 }
      animate(tracker, {
        value: 100,
        duration: DOWNLOAD_DURATION,
        ease: EASE.inOutQuart,
        onUpdate: () => setPercent(tracker.value),
        onComplete: () => finish(null),
      })
      return
    }

    WebLlmProvider.create(pickBestModel(), (report) => {
      setPercent(Math.max(1, Math.min(99, report.progress * 100)))
    })
      .then(finish)
      .catch(() => finish(null))
  }, [existing, setProvider, reduced])

  return { percent, done }
}
