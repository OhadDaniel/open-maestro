import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TutorProvider } from '../../../../ai/provider'
import { resolveTutorProvider } from '../../../../ai/resolve-provider'
import type { BakedLesson } from '../../../../content/baked.types'
import { loadProfile, saveProfile } from '../../../../memory/profile-store'
import type { LearnerProfile } from '../../../../memory/learner-profile.types'
import { createSession } from '../../../../tutor/session'
import { useTutorChat } from '../../../lesson/hooks/useTutorChat'
import { loadThread } from '../../../lesson/thread-store'

export function useLessonThread(baked: BakedLesson, sessionProvider: TutorProvider | null) {
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile())
  const provider = useMemo<TutorProvider>(
    () => resolveTutorProvider(sessionProvider, baked, profile.name),
    [sessionProvider, baked, profile.name],
  )
  const initialSession = useMemo(() => createSession(baked.lesson.id), [baked.lesson.id])

  // Fix 5: load saved thread if one exists
  const savedMessages = useMemo(() => loadThread(baked.lesson.id) ?? undefined, [baked.lesson.id])

  const onProfileLearned = useCallback((learned: LearnerProfile) => {
    saveProfile(learned)
    setProfile(learned)
  }, [])

  const { messages, isStreaming, session, beginLesson, sendMessage, skipTyping } = useTutorChat(
    provider,
    baked,
    initialSession,
    profile,
    onProfileLearned,
    () => {},
    savedMessages,
  )

  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true
    // Skip opening if we restored a saved conversation
    if (savedMessages === undefined || savedMessages.length === 0) {
      void beginLesson()
    }
  }, [beginLesson, savedMessages])

  const send = useCallback(
    (text: string, runResult?: { ok: boolean; output: string }) =>
      void sendMessage(text, runResult),
    [sendMessage],
  )

  return { messages, isStreaming, session, send, skipTyping }
}
