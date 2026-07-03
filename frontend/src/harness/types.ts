import { z } from 'zod'

export const AFFECT_STATES = ['engaged', 'confused', 'frustrated', 'bored', 'confident'] as const
export const MASTERY_STATUSES = ['unseen', 'practicing', 'mastered'] as const
export const TEACHING_ACTIONS = ['explain', 'hint', 'advance', 'quiz', 'encourage', 'close', 'offer-wrap', 'wrap-lesson'] as const

export const affectSignalSchema = z.object({
  state: z.enum(AFFECT_STATES),
  confidence: z.number().min(0).max(1),
  cues: z.array(z.string()),
})
export type AffectSignal = z.infer<typeof affectSignalSchema>

export const masterySignalSchema = z.object({
  skills: z.array(
    z.object({
      id: z.string(),
      status: z.enum(MASTERY_STATUSES),
    }),
  ),
})
export type MasterySignal = z.infer<typeof masterySignalSchema>

export const misconceptionSignalSchema = z.object({
  matched: z.boolean(),
  id: z.string().optional(),
  remediation: z.string().optional(),
})
export type MisconceptionSignal = z.infer<typeof misconceptionSignalSchema>

export const teachingMoveSchema = z.object({
  action: z.enum(TEACHING_ACTIONS),
  rules: z.array(z.string()),
  reason: z.string(),
})
export type TeachingMove = z.infer<typeof teachingMoveSchema>

export type GuardResult = { tripped: boolean; directive?: string }
