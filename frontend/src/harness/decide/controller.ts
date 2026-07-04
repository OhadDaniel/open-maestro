import type { BakedLesson } from '../../content/baked.types'
import type { TutorSession } from '../../content/session.types'
import { AFFECT_ACT_THRESHOLD, MAX_TURNS_PER_OUTCOME, TURN_BUDGET_BUFFER } from '../constants'
import type { AffectSignal, MasterySignal, MisconceptionSignal, TeachingMove } from '../types'
import { ACTION_RULES, MODE_DEFAULT_ACTION, WRAP_DECLINE_PHRASES, misconceptionRules } from './playbooks'

export type ControllerInput = {
  lesson: BakedLesson
  session: TutorSession
  affect: AffectSignal
  mastery: MasterySignal
  misconception: MisconceptionSignal
  turnIndex: number
  userMessage: string
  runResult?: { ok: boolean; output: string }
  turnsOnCurrentOutcome?: number
}

const EXPLICIT_ADVANCE_RE =
  /\b(continue|next|got\s+it|i\s+understand|move\s+on|let'?s\s+go|let'?s\s+continue|skip)\b/i

function isExplicitAdvanceRequest(msg: string): boolean {
  return EXPLICIT_ADVANCE_RE.test(msg)
}

function toMove(
  action: TeachingMove['action'],
  rules: readonly string[],
  reason: string,
): TeachingMove {
  return { action, rules: [...rules], reason }
}

function allOutcomesMastered(mastery: MasterySignal): boolean {
  return mastery.skills.length > 0 && mastery.skills.every((skill) => skill.status === 'mastered')
}

function turnBudget(lesson: BakedLesson): number {
  return lesson.lesson.masteryOutcomes.length * MAX_TURNS_PER_OUTCOME + TURN_BUDGET_BUFFER
}

function wrapAgreed(userMessage: string): boolean {
  const text = userMessage.toLowerCase()
  return WRAP_DECLINE_PHRASES.every((phrase) => !text.includes(phrase))
}

function advanceRules(lesson: BakedLesson, practicingIndex: number): string[] {
  const nextOutcome = lesson.lesson.masteryOutcomes[practicingIndex + 1]
  return nextOutcome !== undefined
    ? [...ACTION_RULES.advance, `Next outcome: ${nextOutcome} — teach exactly this.`]
    : [...ACTION_RULES.advance]
}

function stepContextRules(
  lesson: BakedLesson,
  mastery: MasterySignal,
  practicingIndex: number,
): string[] {
  const n = lesson.lesson.masteryOutcomes.length
  const outcome = lesson.lesson.masteryOutcomes[practicingIndex]
  const masteredTexts = lesson.lesson.masteryOutcomes.filter(
    (_, i) => mastery.skills[i]?.status === 'mastered',
  )
  const rules: string[] = [
    `Current step (${practicingIndex + 1}/${n}): ${outcome} — teach only this step.`,
  ]
  if (masteredTexts.length > 0) {
    rules.push(`Already covered — do not re-teach: ${masteredTexts.join(', ')}.`)
  }
  if (masteredTexts.length === 0) {
    rules.push(
      'This lesson uses code — mention the **Open code panel** button at the bottom of the chat so the student knows where to write and run Python.',
    )
  }
  return rules
}

export function controller(input: ControllerInput): TeachingMove {
  const practicingIndex = input.mastery.skills.findIndex((s) => s.status === 'practicing')
  const turns = input.turnsOnCurrentOutcome ?? 0

  // EARLY: explicit "continue / next / got it / ..." → advance to next step
  if (practicingIndex >= 0 && isExplicitAdvanceRequest(input.userMessage)) {
    return toMove('advance', advanceRules(input.lesson, practicingIndex), 'explicit-advance')
  }

  // EARLY: successful run → the run IS the demonstration
  if (
    practicingIndex >= 0 &&
    input.runResult?.ok === true &&
    input.runResult.output.trim().length > 0
  ) {
    return toMove('advance', advanceRules(input.lesson, practicingIndex), 'run-success')
  }

  // EARLY: per-step turn cap
  if (practicingIndex >= 0 && turns >= MAX_TURNS_PER_OUTCOME) {
    return toMove('advance', advanceRules(input.lesson, practicingIndex), 'turn-cap')
  }

  if (input.misconception.matched) {
    return toMove('explain', misconceptionRules(input.misconception), 'address misconception')
  }

  if (input.affect.confidence >= AFFECT_ACT_THRESHOLD) {
    if (input.affect.state === 'frustrated') {
      return toMove('encourage', ACTION_RULES.encourage, 'student is frustrated')
    }
    if (input.affect.state === 'confused') {
      return toMove('explain', ACTION_RULES.explain, 'student is confused')
    }
    if (input.affect.state === 'bored') {
      return toMove('quiz', ACTION_RULES.quiz, 'student is disengaged')
    }
    if (input.affect.state === 'confident' && practicingIndex >= 0) {
      return toMove('advance', advanceRules(input.lesson, practicingIndex), 'confident-claim')
    }
  }

  if (input.session.progress.completed) {
    return toMove('wrap-lesson', ACTION_RULES['wrap-lesson'], 'lesson already complete')
  }

  if (allOutcomesMastered(input.mastery)) {
    const { wrapOffered, wrapDeclined } = input.session.progress
    if (!wrapOffered && !wrapDeclined) {
      return toMove('offer-wrap', ACTION_RULES['offer-wrap'], 'all outcomes mastered')
    }
    if (wrapOffered && !wrapDeclined) {
      if (wrapAgreed(input.userMessage) || input.turnIndex >= turnBudget(input.lesson)) {
        return toMove('wrap-lesson', ACTION_RULES['wrap-lesson'], 'wrap agreed')
      }
      return toMove(
        MODE_DEFAULT_ACTION[input.session.mode],
        ACTION_RULES[MODE_DEFAULT_ACTION[input.session.mode]],
        'wrap-declined',
      )
    }
  }

  if (input.turnIndex >= turnBudget(input.lesson)) {
    return toMove('wrap-lesson', ACTION_RULES['wrap-lesson'], 'turn budget reached')
  }

  const action = MODE_DEFAULT_ACTION[input.session.mode]
  const stepRules =
    practicingIndex >= 0 ? stepContextRules(input.lesson, input.mastery, practicingIndex) : []
  return toMove(action, [...ACTION_RULES[action], ...stepRules], `mode default (${input.session.mode})`)
}
