import type { TutorMode, TutorSession } from '../content/session.types'

export function createSession(lessonId: string): TutorSession {
  return {
    lessonId,
    mode: 'explain',
    prefs: { name: null },
    progress: { lessonId, checksPassed: [], completed: false },
  }
}

export function setName(session: TutorSession, name: string): TutorSession {
  return { ...session, prefs: { ...session.prefs, name } }
}

export function setMode(session: TutorSession, mode: TutorMode): TutorSession {
  return { ...session, mode }
}

export function passCheck(session: TutorSession, checkId: string): TutorSession {
  if (session.progress.checksPassed.includes(checkId)) {
    return session
  }
  return {
    ...session,
    progress: {
      ...session.progress,
      checksPassed: [...session.progress.checksPassed, checkId],
    },
  }
}

export function completeLesson(session: TutorSession): TutorSession {
  return { ...session, progress: { ...session.progress, completed: true } }
}
