import type { BakedLesson } from '../../content/baked.types'
import type { TutorSession } from '../../content/session.types'
import type { MasterySignal } from '../types'

function outcomeStatus(
  index: number,
  session: TutorSession,
): 'unseen' | 'practicing' | 'mastered' {
  const id = String(index)
  if (session.progress.completed || session.progress.masteredOutcomes.includes(id)) {
    return 'mastered'
  }
  for (let i = 0; i < index; i++) {
    if (!session.progress.masteredOutcomes.includes(String(i))) {
      return 'unseen'
    }
  }
  return 'practicing'
}

export function masteryTracer(session: TutorSession, lesson: BakedLesson): MasterySignal {
  return {
    skills: lesson.lesson.masteryOutcomes.map((_, index) => ({
      id: String(index),
      status: outcomeStatus(index, session),
    })),
  }
}
