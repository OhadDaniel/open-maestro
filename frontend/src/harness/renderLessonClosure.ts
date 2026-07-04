import type { BakedLesson, Check } from '../content/baked.types'
import type { LearnerProfile } from '../memory/learner-profile.types'
import type { RunEvidence } from './sense/masteryCompletion'

export function checkForOutcome(baked: BakedLesson, outcomeIndex: number): Check | undefined {
  if (baked.lesson.id === 'py101-w1-welcome') {
    if (outcomeIndex === 0) return undefined
    return baked.checks[outcomeIndex - 1]
  }
  if (baked.lesson.id === 'py101-w1-unlocking-print-power-ups') {
    // 3 outcomes, 2 checks: outcomes 0+1 share checks[0] (commas); outcome 2 → checks[1] (+/*)
    return outcomeIndex === 2 ? baked.checks[1] : baked.checks[0]
  }
  return baked.checks[outcomeIndex] ?? baked.checks[baked.checks.length - 1]
}

function skillSentence(baked: BakedLesson): string {
  const lid = baked.lesson.id
  if (lid === 'py101-w1-welcome' || lid === 'py101-w1-writing-your-first-program') {
    return "That's print() — you told the computer exactly what to say, and it said it."
  }
  if (lid === 'py101-w1-unlocking-print-power-ups') {
    const firstSentence = baked.celebration.recap.match(/^[^.!?]*[.!?]/)?.[0]?.trim()
    return firstSentence ?? "You just used print()'s power-ups — commas, multiple lines, and + / * to shape output."
  }
  const recap = baked.celebration.recap
  return (recap.match(/^[^.!?]*[.!?]/)?.[0] ?? recap).trim()
}

export function renderLessonClosure(
  baked: BakedLesson,
  _profile: LearnerProfile,
  evidence?: RunEvidence,
): string {
  const lastOutcomeIndex = baked.lesson.masteryOutcomes.length - 1
  const check = checkForOutcome(baked, lastOutcomeIndex)
  const parts: string[] = []

  if (evidence) {
    const firstLine = evidence.output.split('\n')[0]?.trim() ?? ''
    if (firstLine.length > 0) {
      parts.push(`There it is — your code printed: "${firstLine}".`)
    }
  }

  parts.push(skillSentence(baked))
  parts.push(check?.passFeedback ?? baked.celebration.recap)
  parts.push("That's the modest mastery of this lesson on the climb. When you're ready, wrap up below.")

  return parts.join('\n\n')
}
