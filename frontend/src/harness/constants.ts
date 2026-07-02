import type { AffectSignal, MasterySignal, MisconceptionSignal, TeachingMove } from './types'

export const NEUTRAL_AFFECT: AffectSignal = { state: 'engaged', confidence: 0, cues: [] }
export const EMPTY_MASTERY: MasterySignal = { skills: [] }
export const NO_MISCONCEPTION: MisconceptionSignal = { matched: false }
export const PASS_THROUGH_MOVE: TeachingMove = {
  action: 'explain',
  rules: [],
  reason: 'pass-through',
}

export const AFFECT_ACT_THRESHOLD = 0.6
export const TURNS_PER_OUTCOME = 4
export const TURN_BUDGET_BUFFER = 3
