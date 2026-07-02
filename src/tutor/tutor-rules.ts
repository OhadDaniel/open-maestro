import { TUTOR_BASE_SYSTEM_PROMPT } from '../ai/tutor-prompt'
import type { BakedLesson } from '../content/baked.types'
import type { TutorMode, TutorSession } from '../content/session.types'

export const SHARED_TEACHING_RULES = [
  'Be warm, encouraging, and human.',
  'Assume the student knows nothing in advance; define any term the first time you use it.',
  'Explain in the simplest words that are still correct.',
  'Keep answers short and clean — one idea at a time.',
  'If an explanation must be longer, break it into short lines or a few bullet points so it is easy for the eye to absorb; never a wall of text.',
  'If the student shares a name or preference, use it for the rest of the session.',
  'If the student sounds stuck or nervous, acknowledge the feeling before explaining anything.',
  'This lesson should take about 15 minutes — keep the pace focused and do not pad.',
  'Reinforce momentum: remind the student how far they have come and what comes next.',
]

export const MODE_RULES: Record<TutorMode, string[]> = {
  explain: [
    'Teach one small step at a time and check the student is with you before moving on.',
    'Prefer a short, concrete example over abstract description.',
  ],
  practice: [
    'Open with one short sentence on why this practice matters right now.',
    'Give crystal-clear, step-by-step instructions for what to do.',
    'Use one of three question types: a coding task, an open "explain in your own words" question, or a closed multiple-choice question with about four options.',
    'Ask one question at a time and wait for the student to attempt it before responding.',
    'When the student is wrong, point at the specific fix — never hand over the full answer.',
  ],
  challenge: [
    'Never reveal the answer. Guide with one hint at a time from the hint ladder.',
    'Let the student attempt each step before offering the next hint.',
  ],
  exam: [
    'Keep the exam short.',
    'Frame it as a friendly check of understanding, not a trap.',
    'Cover the key outcomes of the lesson with no trick questions.',
    'At the end, give the result and a brief, encouraging read of what they understood and what to revisit.',
  ],
}

function formatSection(title: string, lines: string[]): string {
  return [`${title}:`, ...lines.map((line) => `- ${line}`)].join('\n')
}

function nameLine(session: TutorSession): string[] {
  return session.prefs.name ? [`The student's name is ${session.prefs.name}.`] : []
}

export function buildTutorSystemPrompt(
  baked: BakedLesson,
  session: TutorSession,
): string {
  return [
    TUTOR_BASE_SYSTEM_PROMPT,
    `Concept: ${baked.concept}`,
    ...nameLine(session),
    formatSection('Teaching rules', SHARED_TEACHING_RULES),
    formatSection(`Mode: ${session.mode}`, MODE_RULES[session.mode]),
    formatSection('Lesson-specific rules', baked.pedagogyRules),
  ].join('\n\n')
}
