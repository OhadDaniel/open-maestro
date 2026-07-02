import type { BakedLesson } from '../../frontend/src/content/baked.types'
import { buildContext } from '../../frontend/src/harness/buildContext'
import { controller } from '../../frontend/src/harness/decide/controller'
import { affectObserver } from '../../frontend/src/harness/sense/affectObserver'
import { masteryTracer } from '../../frontend/src/harness/sense/masteryTracer'
import { misconceptionDiagnoser } from '../../frontend/src/harness/sense/misconceptionDiagnoser'
import { emptyProfile } from '../../frontend/src/memory/learner-profile'
import { createSession } from '../../frontend/src/tutor/session'
import type { TutorPolicy } from '../../frontend/src/tutor/tutor-rules'
import { DEFAULT_POLICY } from '../../frontend/src/tutor/tutor-rules'
import type { ChatTurn } from '../eval/openai-client'
import { MODELS, completeChat } from '../eval/openai-client'
import type { StudentPersona } from './student-sim'
import { studentReply } from './student-sim'

const MAX_EXCHANGES = 4
const DONE = '[DONE]'

function renderTranscript(turns: ChatTurn[]): string {
  return turns
    .map((turn) => `${turn.role === 'assistant' ? 'Maestro' : 'Student'}: ${turn.content}`)
    .join('\n')
}

function countStudentTurns(turns: ChatTurn[]): number {
  return turns.filter((turn) => turn.role === 'user').length
}

export async function runConversation(
  persona: StudentPersona,
  lesson: BakedLesson,
  policy: TutorPolicy = DEFAULT_POLICY,
): Promise<ChatTurn[]> {
  const session = createSession(lesson.lesson.id)
  const profile = emptyProfile()
  const turns: ChatTurn[] = [{ role: 'user', content: persona.opener }]
  for (let exchange = 0; exchange < MAX_EXCHANGES; exchange += 1) {
    const lastUser = turns[turns.length - 1]?.content ?? persona.opener
    const affect = affectObserver(lastUser, turns)
    const mastery = masteryTracer(session, lesson)
    const misconception = misconceptionDiagnoser(lastUser, lesson)
    const move = controller({
      lesson,
      session,
      affect,
      mastery,
      misconception,
      turnIndex: countStudentTurns(turns),
    })
    const request = buildContext({ baked: lesson, session, profile, messages: turns, move, misconception, policy })
    turns.push({ role: 'assistant', content: await completeChat(MODELS.tutor, request.system, turns) })
    const student = await studentReply(persona, renderTranscript(turns))
    if (student.includes(DONE)) {
      break
    }
    turns.push({ role: 'user', content: student })
  }
  return turns
}
