import { complete } from './openai-client'
import type { RubricCriterion, Scenario } from './scenarios'

const JUDGE_MODEL = 'gpt-5.2-chat-latest'

const JUDGE_SYSTEM =
  'You are a strict, fair grader of tutoring quality. You are given a student message, one tutor reply, and pass/fail criteria. Judge ONLY the reply against each criterion. Do not reward length, politeness, or confidence for their own sake. Return strict JSON and nothing else.'

export type CriterionResult = { id: string; pass: boolean; reason: string }

function buildJudgeUser(
  studentPrompt: string,
  reply: string,
  rubric: RubricCriterion[],
): string {
  const criteria = rubric.map((item) => `- ${item.id}: ${item.text}`).join('\n')
  return [
    `Student message:\n${studentPrompt}`,
    `Tutor reply:\n${reply}`,
    `Criteria:\n${criteria}`,
    'Return JSON only: {"results":[{"id":"<criterion id>","pass":true or false,"reason":"<one short sentence>"}]}',
  ].join('\n\n')
}

function parseResults(text: string): CriterionResult[] {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  const parsed = JSON.parse(text.slice(start, end + 1)) as {
    results: CriterionResult[]
  }
  return parsed.results
}

export async function judgeReply(
  scenario: Scenario,
  reply: string,
): Promise<CriterionResult[]> {
  const raw = await complete(
    JUDGE_MODEL,
    JUDGE_SYSTEM,
    buildJudgeUser(scenario.studentPrompt, reply, scenario.rubric),
  )
  return parseResults(raw)
}
