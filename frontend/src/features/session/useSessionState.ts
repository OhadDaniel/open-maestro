import { useCallback, useState } from 'react'
import type { TutorProvider } from '../../ai/provider'
import { loadProfile, saveProfile } from '../../memory/profile-store'
import {
  INITIAL_IDENTITY,
  INITIAL_PROGRESS,
  INITIAL_STREAK,
  INITIAL_USER,
} from './session.constants'
import type {
  SessionIdentity,
  SessionProgress,
  SessionStreak,
  SessionUser,
} from './session.types'

export function useSessionState() {
  const [user, setUser] = useState<SessionUser>(INITIAL_USER)
  const [progress, setProgress] = useState<SessionProgress>(INITIAL_PROGRESS)
  const [streak] = useState<SessionStreak>(INITIAL_STREAK)
  const [identity] = useState<SessionIdentity>(INITIAL_IDENTITY)
  const [provider, setProvider] = useState<TutorProvider | null>(null)

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((current) => {
      const next = { ...current, ...patch }
      const profile = loadProfile()
      saveProfile({
        ...profile,
        name: next.name.trim().length > 0 ? next.name.trim() : profile.name,
        goal: next.why.trim().length > 0 ? next.why.trim() : profile.goal,
      })
      return next
    })
  }, [])

  const advanceLesson = useCallback(() => {
    setProgress((current) => ({ ...current, lessonStep: Math.min(current.lessonStep + 1, 5) }))
  }, [])

  return {
    user,
    progress,
    streak,
    identity,
    provider,
    setProvider,
    updateUser,
    advanceLesson,
  }
}
