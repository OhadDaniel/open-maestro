import type { ChatTurn } from '../eval/openai-client'
import { MODELS, completeJson } from '../eval/openai-client'

export type ConversationCriterion = { id: string; text: string }

export const CONVERSATION_RUBRIC: ConversationCriterion[] = [
  { id: 'respects-mastery', text: 'When the student showed they already knew something, the tutor acknowledged it and did NOT re-drill it or invent trivial busywork.' },
  { id: 'no-filler', text: 'The tutor never labeled a trivial variation as "more challenging" and never padded the lesson with make-work.' },
  { id: 'closes-lesson', text: 'Once the lesson outcomes were met, the tutor wrapped up and pointed the student onward, instead of inventing more tasks.' },
  { id: 'no-repeat', text: 'The tutor did not repeat the same suggestion or question after it was already handled.' },
  { id: 'respects-decline', text: 'When the student declined, the tutor moved on or offered an alternative rather than insisting.' },
  { id: 'warm-concise', text: 'The tutor stayed warm, human, and concise throughout — no walls of text.' },
  { id: 'correct-content', text: 'Everything the tutor stated about Python was technically correct — no factual or code errors.' },
  { id: 'one-step-at-a-time', text: 'The tutor introduced one idea at a time and checked the student was following before adding more.' },
  { id: 'handles-wrong-answer', text: 'When the student was wrong or confidently wrong, the tutor corrected it clearly without simply handing over the full answer.' },
  { id: 'stays-on-topic', text: 'When the student went off-topic or tried to jump ahead, the tutor gently redirected to the current lesson.' },
  { id: 'defines-terms', text: 'The tutor defined any new term or piece of jargon the first time it was used.' },
  { id: 'specific-encouragement', text: 'Any encouragement was specific and earned, not empty or generic praise.' },
  { id: 'adapts-to-pace', text: 'The tutor matched the student — speeding up for fast learners, slowing down and reassuring anxious or confused ones.' },
]

export type CriterionResult = { id: string; pass: boolean; reason: string }

function transcript(turns: ChatTurn[]): string {
  return turns
    .map((turn) => `${turn.role === 'assistant' ? 'Tutor' : 'Student'}: ${turn.content}`)
    .join('\n')
}

const JUDGE_SYSTEM =
  "You are a strict, fair grader of tutoring conversations. Judge ONLY the tutor's behavior across the whole conversation against each criterion. Do not reward length or confidence. Return strict JSON only."

export async function judgeConversation(turns: ChatTurn[]): Promise<CriterionResult[]> {
  const criteria = CONVERSATION_RUBRIC.map((item) => `- ${item.id}: ${item.text}`).join('\n')
  const user = [
    `Conversation:\n${transcript(turns)}`,
    `Criteria:\n${criteria}`,
    'Return JSON only: {"results":[{"id":"<criterion id>","pass":true or false,"reason":"<one short sentence>"}]}',
  ].join('\n\n')
  const parsed = (await completeJson(MODELS.judge, JUDGE_SYSTEM, user)) as {
    results?: CriterionResult[]
  }
  if (!Array.isArray(parsed.results)) {
    throw new Error('judge did not return a results array')
  }
  return parsed.results
}
