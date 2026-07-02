import type { RawLesson } from '../src/content/lesson.types'

export const BAKE_SYSTEM_PROMPT = `You are a world-class curriculum designer and tutoring-quality engineer.
Given a Maestro lesson and its mastery outcomes, produce the full baked teaching layer as a single JSON object that strictly matches the BakedLesson schema.

Hard requirements:
- Output JSON only. No prose, no markdown fences.
- Ground every explanation, hint, and check in the lesson's mastery outcomes. Do not invent unrelated material.
- explanations: provide eli5, standard, and deep.
- hintLadder: progressive hints ordered 1..n that guide toward the answer and NEVER reveal the final answer.
- misconceptions: the most common wrong turns for this concept, each with the corrective teaching move.
- checks: at least one, each with concrete acceptanceCriteria and both pass and fail feedback.
- failurePlaybooks: map this lesson to the relevant TutorBench failure modes and state the correct teaching move for each. Use ids like SWE-02 or BIZ-05.
- chunks: short, self-contained, citable excerpts the tutor will be grounded on. Set embedding to null.
- celebration: an afterglow reveal of what the learner can now do, not a dry summary.
- pedagogyRules: concrete rules the tutor must follow in this lesson.`

const TUTORBENCH_MODES = [
  'preference/name miss',
  'unsignaled mode/instruction',
  'emotional attunement miss',
  'challenge-answer leak',
  'tutor factual/math error',
  'validated wrong work',
  'scaffolding gap (too fast)',
  'placeholder-syntax confusion',
  'taught/tested before explaining',
  'lost track / target-switch',
]

export function buildBakeUserPrompt(raw: RawLesson): string {
  return [
    'Lesson to bake:',
    JSON.stringify(raw, null, 2),
    '---',
    `TutorBench failure modes to defend against: ${TUTORBENCH_MODES.join(', ')}.`,
    'Return the BakedLesson JSON object now.',
  ].join('\n\n')
}
