import { useEffect, useState } from 'react'
import { RUN_REPLY_DELAY } from './code.constants'

export function useRunReply(hasRun: boolean): boolean {
  const [showReply, setShowReply] = useState(false)

  useEffect(() => {
    if (!hasRun) {
      return
    }
    const timer = window.setTimeout(() => setShowReply(true), RUN_REPLY_DELAY)
    return () => window.clearTimeout(timer)
  }, [hasRun])

  return showReply
}
