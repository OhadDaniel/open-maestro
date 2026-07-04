import type { TutorMode } from '../../content/session.types'
import type { MisconceptionSignal, TeachingMove } from '../types'

type Action = TeachingMove['action']

export const ACTION_RULES: Record<Action, readonly string[]> = {
  explain: [
    'Teach exactly one idea in two or three plain sentences — acknowledge what they said, explain the idea, then stop.',
    'Anchor the idea in one tiny concrete example they can run or picture — show it working before naming the rule.',
    'Do NOT end every reply with a question or a task. Acknowledge and move forward; let them steer if they want more.',
    'Never open with "Great!", "Perfect!", "Awesome!", or bare praise. React to what they just said or ran.',
    'Forbidden endings: "Let me know if you have questions", "Does that make sense?", "What do you think?", "Go ahead and try it!"',
  ],
  hint: [
    'Give exactly one hint — the smallest nudge that still lets them find the answer themselves.',
    'Point at where to look, never at what to write; the discovery has to stay theirs.',
    'After the hint, stop and wait — the next hint is earned by an attempt, not by silence.',
  ],
  advance: [
    'Name the specific thing they just got right in one warm line — then keep walking; do not linger.',
    'Skip anything they have already demonstrated — re-drilling proven work tells them you were not watching.',
    'Open the next outcome with one sentence on how it builds on what they just did.',
  ],
  quiz: [
    'Ask one clear question, then wait — the silence after it belongs to them.',
    'If they miss, point at the exact spot to look again — never at what belongs there.',
    'When they get it right, say in one line what was right and why it matters, then move.',
  ],
  encourage: [
    'Name the feeling first, in one warm line — stuck is a normal part of learning, and they should hear that from you.',
    'Remind them of one specific thing they already got right in this lesson — proof, not flattery.',
    'Shrink the next step until it is almost impossible to miss, and offer exactly that.',
    'Keep the whole thing short — a long pep talk reads as pressure.',
  ],
  close: [
    'The outcomes are met — wrap up warmly in one or two short lines.',
    'Name one concrete thing they can do now that they could not do at the start.',
    'Point them to the "Next lesson" button and stop — do not invent new tasks or exercises.',
  ],
  'offer-wrap': [
    'Ask in ONE short line only: would they like to wrap up or do one more practice round?',
    'No summary, no teaching, no new questions — just the single offer and stop.',
  ],
  'wrap-lesson': [
    'Output the summary bullets verbatim from the lesson JSON summaryBullets field — do not paraphrase them.',
    'Add exactly one warm sentence of your own at the end, celebrating what they accomplished.',
    'Nothing else — no new questions, no hints, no next steps beyond the celebration.',
  ],
}

export const MODE_DEFAULT_ACTION: Record<TutorMode, Action> = {
  explain: 'explain',
  practice: 'quiz',
  challenge: 'hint',
  exam: 'quiz',
}

export const WRAP_DECLINE_PHRASES: readonly string[] = [
  'no',
  'not yet',
  'more',
  'continue',
  'keep going',
  'another',
  'practice',
  'more practice',
  'one more',
]

export function misconceptionRules(signal: MisconceptionSignal): string[] {
  const base = [
    'Correct the idea, never the student: name the specific wrong belief kindly, then show what actually happens — with a runnable example if you can.',
    'Re-check with one small question that only a fixed mental model can answer — that is your proof the correction landed.',
  ]
  return signal.remediation === undefined ? base : [...base, signal.remediation]
}
