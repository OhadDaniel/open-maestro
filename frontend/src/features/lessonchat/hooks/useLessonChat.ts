import { useCallback, useEffect, useRef, useState } from 'react'
import type { BakedLesson } from '../../../content/baked.types'
import { loadBakedLesson } from '../../../content/load-lesson'
import { usePyodide } from '../../code/usePyodide'
import { COURSE_ID, LESSON_SLUG, STARTER_CODE } from '../lessonchat.constants'

const DEMO_STDIN: readonly string[] = ['Ray']

export function useLessonChat() {
  const [baked, setBaked] = useState<BakedLesson | null>(null)
  const [code, setCode] = useState(STARTER_CODE)
  const [runCount, setRunCount] = useState(0)
  const { status, lastResult, run: runPy } = usePyodide()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) {
      return
    }
    loadedRef.current = true
    void loadBakedLesson(COURSE_ID, LESSON_SLUG)
      .then(setBaked)
      .catch(() => setBaked(null))
  }, [])

  const run = useCallback(async () => {
    await runPy(code, DEMO_STDIN)
    setRunCount((count) => count + 1)
  }, [code, runPy])

  return {
    baked,
    ready: baked !== null,
    code,
    setCode,
    runResult: lastResult,
    running: status === 'loading',
    runCount,
    hasRun: runCount > 0,
    run,
  }
}
