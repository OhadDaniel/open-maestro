import type { BakedLesson } from '../../content/baked.types'
import type { TutorSession } from '../../content/session.types'
import { AFFECT_ACT_THRESHOLD, TURNS_PER_OUTCOME, TURN_BUDGET_BUFFER } from '../constants'
import type { AffectSignal, MasterySignal, MisconceptionSignal, TeachingMove } from '../types'
import { ACTION_RULES, MODE_DEFAULT_ACTION, misconceptionRules } from './playbooks'

export type ControllerInput = {
  lesson: BakedLesson
  session: TutorSession
  affect: AffectSignal
  mastery: MasterySignal
  misconception: MisconceptionSignal
  turnIndex: number
}

function toMove(
  action: TeachingMove['action'],
  rules: readonly string[],
  reason: string,
): TeachingMove {
  return { action, rules: [...rules], reason }
}

function allOutcomesMastered(mastery: MasterySignal, lesson: BakedLesson): boolean {
  const outcomeCount = lesson.lesson.masteryOutcomes.length
  if (mastery.skills.length === 0 || mastery.skills.length < outcomeCount) {
    return false
  }
  return mastery.skills.every((skill) => skill.status === 'mastered')
}

function turnBudget(lesson: BakedLesson): number {
  return lesson.lesson.masteryOutcomes.length * TURNS_PER_OUTCOME + TURN_BUDGET_BUFFER
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
  }
  if (input.session.progress.completed || allOutcomesMastered(input.mastery, input.lesson)) {
    return toMove('close', ACTION_RULES.close, 'outcomes met')
  }
  if (input.turnIndex >= turnBudget(input.lesson)) {
    return toMove('close', ACTION_RULES.close, 'turn budget reached')
  }
  const action = MODE_DEFAULT_ACTION[input.session.mode]
  return toMove(action, ACTION_RULES[action], `mode default (${input.session.mode})`)
}
