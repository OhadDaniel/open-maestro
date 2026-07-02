import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { BakedLesson } from '../../frontend/src/content/baked.types'
import { bakedLessonSchema } from '../../frontend/src/content/baked.types'
import { emptyProfile, withName } from '../../frontend/src/memory/learner-profile'
import { createSession, setMode } from '../../frontend/src/tutor/session'
import { buildTutorRequest } from '../../frontend/src/tutor/tutor-engine'
import { complete } from './openai-client'
import type { Scenario } from './scenarios'

export const OURS_MODEL = 'gpt-4o-mini'
export const EVERYDAY_MODEL = 'gpt-5.1-chat-latest'

const EVERYDAY_SYSTEM = 'You are a helpful Python tutor.'

const LESSON_PATH = fileURLToPath(
  new URL(
    '../../frontend/public/content/py101/writing-your-first-program.json',
    import.meta.url,
  ),
)

function loadLesson(): BakedLesson {
  const raw: unknown = JSON.parse(readFileSync(LESSON_PATH, 'utf8'))
  return bakedLessonSchema.parse(raw)
}

const lesson = loadLesson()

export async function everydayAnswer(scenario: Scenario): Promise<string> {
  return complete(EVERYDAY_MODEL, EVERYDAY_SYSTEM, scenario.studentPrompt)
}

export async function ourAnswer(scenario: Scenario): Promise<string> {
  const profile = scenario.studentName
    ? withName(emptyProfile(), scenario.studentName)
    : emptyProfile()
  const session = setMode(createSession(lesson.lesson.id), scenario.mode)
  const request = buildTutorRequest(lesson, session, profile, [
    { role: 'user', content: scenario.studentPrompt },
  ])
  return complete(OURS_MODEL, request.system, scenario.studentPrompt)
}
