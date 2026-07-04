import { useCallback, useEffect, useState } from 'react'
import type { BakedLesson } from '../../../content/baked.types'
import { loadBakedLesson } from '../../../content/load-lesson'
import { loadProfile } from '../../../memory/profile-store'
import { useViewedLesson } from '../../lessonview/useViewedLesson'
import { usePyodide } from '../../code/usePyodide'
import { COURSE_ID } from '../lessonchat.constants'

const STDIN_FALLBACK = 'friend'

function demoStdin(): readonly string[] {
  const name = loadProfile().name
  return [name !== null && name.trim().length > 0 ? name.trim() : STDIN_FALLBACK]
}

export function useLessonChat() {
  const { slug: currentLessonSlug } = useViewedLesson()
  const [baked, setBaked] = useState<BakedLesson | null>(null)
  const [code, setCode] = useState('')
  const [runCount, setRunCount] = useState(0)
  const { status, lastResult, run: runPy } = usePyodide()

  useEffect(() => {
    if (currentLessonSlug === '') {
      return
    }
    let active = true
    setBaked(null)
    setCode('')
    void loadBakedLesson(COURSE_ID, currentLessonSlug)
      .then((lesson) => {
        if (active) {
          setBaked(lesson)
          const coding = lesson.practice?.find((q) => q.kind === 'coding')
          setCode(coding?.starterCode ?? '')
        }
      })
      .catch(() => {
        if (active) {
          setBaked(null)
          setCode('')
        }
      })
    return () => {
      active = false
    }
  }, [currentLessonSlug])

  const run = useCallback(async () => {
    await runPy(code, demoStdin())
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
