import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TutorProvider } from '../../../../ai/provider'
import { resolveTutorProvider } from '../../../../ai/resolve-provider'
import type { BakedLesson } from '../../../../content/baked.types'
import { loadProfile, saveProfile } from '../../../../memory/profile-store'
import type { LearnerProfile } from '../../../../memory/learner-profile.types'
import { createSession } from '../../../../tutor/session'
import { useTutorChat } from '../../../lesson/hooks/useTutorChat'

export function useLessonThread(baked: BakedLesson, sessionProvider: TutorProvider | null) {
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile())
  const provider = useMemo<TutorProvider>(
    () => resolveTutorProvider(sessionProvider, baked, profile.name),
    [sessionProvider, baked, profile.name],
  )
  const session = useMemo(() => createSession(baked.lesson.id), [baked.lesson.id])

  const onProfileLearned = useCallback((learned: LearnerProfile) => {
    saveProfile(learned)
    setProfile(learned)
  }, [])

  const { messages, isStreaming, beginLesson, sendMessage } = useTutorChat(
    provider,
    baked,
    session,
    profile,
    onProfileLearned,
    () => undefined,
  )

  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true
    void beginLesson()
  }, [beginLesson])

  const send = useCallback((text: string) => void sendMessage(text), [sendMessage])

  return { messages, isStreaming, send }
}
