import type { BakedLesson } from '../../content/baked.types'
import type { TutorSession } from '../../content/session.types'
import { AFFECT_ACT_THRESHOLD, TURNS_PER_OUTCOME, TURN_BUDGET_BUFFER } from '../constants'
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
  return lesson.lesson.masteryOutcomes.length * TURNS_PER_OUTCOME + TURN_BUDGET_BUFFER
}

function wrapAgreed(userMessage: string): boolean {
  const text = userMessage.toLowerCase()
  return WRAP_DECLINE_PHRASES.every((phrase) => !text.includes(phrase))
}

export function controller(input: ControllerInput): TeachingMove {
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
    if (input.affect.state === 'confident') {
      const practicingIndex = input.mastery.skills.findIndex((s) => s.status === 'practicing')
      const nextOutcome = input.lesson.lesson.masteryOutcomes[practicingIndex + 1]
      const rules =
        nextOutcome !== undefined
          ? [...ACTION_RULES.advance, `Next outcome: ${nextOutcome} — teach exactly this`]
          : ACTION_RULES.advance
      return toMove('advance', rules, 'confident-claim')
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
  return toMove(action, ACTION_RULES[action], `mode default (${input.session.mode})`)
}
