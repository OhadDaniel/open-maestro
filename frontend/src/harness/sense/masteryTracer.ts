import type { BakedLesson } from '../../content/baked.types'
import type { TutorSession } from '../../content/session.types'
import type { MasterySignal } from '../types'

export function masteryTracer(session: TutorSession, lesson: BakedLesson): MasterySignal {
  const checksDone =
    lesson.checks.length > 0 && session.progress.checksPassed.length >= lesson.checks.length
  const mastered = session.progress.completed || checksDone
  return {
    skills: lesson.lesson.masteryOutcomes.map((_outcome, index) => ({
      id: String(index),
      status: mastered ? 'mastered' : 'unseen',
    })),
  }
}
