import { TUTOR_BASE_SYSTEM_PROMPT, buildLessonContextBlock } from '../ai/tutor-prompt'
import type { BakedLesson } from '../content/baked.types'
import type { TutorMode, TutorSession } from '../content/session.types'
import { renderProfileSnapshot } from '../memory/learner-profile'
import type { LearnerProfile } from '../memory/learner-profile.types'
import type { Exemplar } from './exemplars'
import { EVERYDAY_MOMENTS } from './persona'
import tutorPolicyData from './tutor-policy.json'

export const SHARED_TEACHING_RULES = [
  'Assume the student knows nothing in advance; define any term the first time you use it.',
  'Explain in the simplest words that are still correct.',
  'Keep answers short and clean — one idea at a time.',
  'If an explanation must be longer, break it into short lines so it is easy to absorb; never a wall of text.',
  'If the student sounds stuck or nervous, acknowledge the feeling before explaining anything.',
  'Reinforce momentum: remind the student how far they have come and what comes next.',
]

export const PROGRESSION_RULES = [
  'CRITICAL: If the student demonstrates or credibly says they already know the current step, mark it done and IMMEDIATELY move to the next remaining outcome. If none remain, wrap up in one line and tell them to hit "Next lesson". Never re-verify, re-drill, or add practice they did not ask for.',
  'The lesson has ONLY the outcomes in the plan above — nothing more. Never invent extra tasks or busywork, and never call a trivial variation "more challenging."',
  'Track from the conversation which outcomes are already done, and work only on what is left.',
  'When the student completes a step, acknowledge it in one line and move to the next remaining outcome.',
  'Never repeat or re-ask something the student already handled. If they decline or say "move on", advance immediately — never insist or loop.',
  'When every outcome is demonstrated, tell the student they have finished this lesson and invite them to continue with the "Next lesson" button. Do not generate more exercises after that.',
  'Never imply you have met the student before unless their saved memory includes a name or past work.',
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

export type TutorPolicy = {
  persona: string
  progressionRules: string[]
  exemplars: Exemplar[]
}

export const DEFAULT_POLICY: TutorPolicy = tutorPolicyData as TutorPolicy

function formatSection(title: string, lines: string[]): string {
  return [`${title}:`, ...lines.map((line) => `- ${line}`)].join('\n')
}

function lessonContext(baked: BakedLesson): string {
  const chunks = baked.chunks.map((chunk) => ({
    id: chunk.id,
    text: chunk.text,
    source: baked.lesson.title,
  }))
  return `Lesson material (teach only from this):\n${buildLessonContextBlock(chunks)}`
}

function lessonPlan(baked: BakedLesson): string {
  const steps = baked.lesson.masteryOutcomes.map((outcome, index) => `${index + 1}. ${outcome}`)
  return ['Lesson plan — teach these in order, one at a time:', ...steps].join('\n')
}

function formatMoments(): string {
  const lines = EVERYDAY_MOMENTS.map((moment) => `- When ${moment.when}: ${moment.move}`)
  return ['In common moments, handle them like this:', ...lines].join('\n')
}

function formatExemplars(exemplars: Exemplar[]): string {
  const blocks = exemplars.map(
    (exemplar) =>
      `(${exemplar.tone})\nStudent: "${exemplar.student}"\nYou: "${exemplar.tutor}"`,
  )
  return [
    'How you sound — style examples. Match this warmth, brevity, and shape. Do not reuse the wording or pretend these exchanges happened; they only show your voice:',
    ...blocks,
  ].join('\n\n')
}

export function buildTutorSystemPrompt(
  baked: BakedLesson,
  session: TutorSession,
  profile: LearnerProfile,
  policy: TutorPolicy = DEFAULT_POLICY,
): string {
  return [
    TUTOR_BASE_SYSTEM_PROMPT,
    policy.persona,
    `Lesson: "${baked.lesson.title}" — Concept: ${baked.concept}`,
    lessonPlan(baked),
    formatSection('Keeping the lesson moving (most important)', policy.progressionRules),
    lessonContext(baked),
    `Student memory (carry this from the first turn):\n${renderProfileSnapshot(profile)}`,
    formatSection('Teaching rules', SHARED_TEACHING_RULES),
    formatSection(`Mode: ${session.mode}`, MODE_RULES[session.mode]),
    formatMoments(),
    formatExemplars(policy.exemplars),
    formatSection('Lesson-specific rules', baked.pedagogyRules),
  ].join('\n\n')
}
