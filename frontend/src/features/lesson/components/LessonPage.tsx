import { useEffect, useState } from 'react'
import type { TutorProvider } from '../../../ai/provider'
import type { BakedLesson } from '../../../content/baked.types'
import { loadBakedLesson } from '../../../content/load-lesson'
import { NOOP_LESSON_EVENTS } from '../events'
import { LessonSession } from './LessonSession'

type LessonPageProps = {
  provider: TutorProvider
  courseId: string
  slug: string
  lessonNumber: number
  lessonCount: number
  onNext: () => void
}

export function LessonPage({
  provider,
  courseId,
  slug,
  lessonNumber,
  lessonCount,
  onNext,
}: LessonPageProps) {
  const [baked, setBaked] = useState<BakedLesson | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    loadBakedLesson(courseId, slug)
      .then((lesson) => {
        if (active) {
          setBaked(lesson)
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true)
        }
      })
    return () => {
      active = false
    }
  }, [courseId, slug])

  if (failed) {
    return <div className="lesson-status">Could not load the lesson.</div>
  }
  if (baked === null) {
    return <div className="lesson-status">Loading lesson…</div>
  }
  return (
    <LessonSession
      baked={baked}
      provider={provider}
      events={NOOP_LESSON_EVENTS}
      lessonNumber={lessonNumber}
      lessonCount={lessonCount}
      onNext={onNext}
    />
  )
}
