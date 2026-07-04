import type { TutorMode, TutorSession } from '../content/session.types'

export function createSession(lessonId: string): TutorSession {
  return {
    lessonId,
    mode: 'explain',
    prefs: { name: null },
    progress: {
      lessonId,
      checksPassed: [],
      masteredOutcomes: [],
      wrapOffered: false,
      wrapDeclined: false,
      completed: false,
    },
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

export function masterOutcome(session: TutorSession, index: number): TutorSession {
  const id = String(index)
  if (session.progress.masteredOutcomes.includes(id)) {
    return session
  }
  return {
    ...session,
    progress: {
      ...session.progress,
      masteredOutcomes: [...session.progress.masteredOutcomes, id],
    },
  }
}

export function offerWrap(session: TutorSession): TutorSession {
  return { ...session, progress: { ...session.progress, wrapOffered: true } }
}

export function declineWrap(session: TutorSession): TutorSession {
  return { ...session, progress: { ...session.progress, wrapDeclined: true } }
}

export function completeLesson(session: TutorSession): TutorSession {
  return { ...session, progress: { ...session.progress, completed: true } }
}

export function masterAllOutcomes(session: TutorSession, count: number): TutorSession {
  const all = Array.from({ length: count }, (_, i) => String(i))
  return { ...session, progress: { ...session.progress, masteredOutcomes: all } }
}
