import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TutorProvider } from '../../../../ai/provider'
import { MockTutorProvider } from '../../../../ai/mock-provider'
import type { BakedLesson } from '../../../../content/baked.types'
import { createSession } from '../../../../tutor/session'
import { loadProfile, saveProfile } from '../../../../memory/profile-store'
import type { LearnerProfile } from '../../../../memory/learner-profile.types'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { useTutorChat } from '../../../lesson/hooks/useTutorChat'
import { LESSON_SLUG } from '../../../lessonchat/lessonchat.constants'
import { TYPING_DELAY } from './lesson.constants'

export function useLessonThread(baked: BakedLesson, sessionProvider: TutorProvider | null) {
  const reduced = useReducedMotion()
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile())
  const [typingDone, setTypingDone] = useState(reduced)
  const provider = useMemo(() => sessionProvider ?? new MockTutorProvider(), [sessionProvider])
  const session = useMemo(() => createSession(LESSON_SLUG), [])

  const onProfileLearned = useCallback((learned: LearnerProfile) => {
    saveProfile(learned)
    setProfile(learned)
  }, [])

  const { messages, isStreaming, sendMessage } = useTutorChat(
    provider,
    baked,
    session,
    profile,
    onProfileLearned,
    () => undefined,
  )

  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current || reduced) {
      return
    }
    startedRef.current = true
    const timer = window.setTimeout(() => setTypingDone(true), TYPING_DELAY)
    return () => window.clearTimeout(timer)
  }, [reduced])

  const send = useCallback((text: string) => void sendMessage(text), [sendMessage])

  return { messages, isStreaming, typingDone, profileName: profile.name, send }
}
