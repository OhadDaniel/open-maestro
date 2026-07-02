import { z } from 'zod'
import { rawLessonSchema } from './lesson.types'
import { practiceQuestionSchema } from './question.types'

export const bloomLevelSchema = z.enum([
  'understand',
  'apply',
  'analyze',
  'evaluate',
])
export type BloomLevel = z.infer<typeof bloomLevelSchema>
export const BLOOM_LEVELS = bloomLevelSchema.options

export const explanationLevelSchema = z.enum(['eli5', 'standard', 'deep'])
export type ExplanationLevel = z.infer<typeof explanationLevelSchema>
export const EXPLANATION_LEVELS = explanationLevelSchema.options

export const explanationSchema = z
  .object({ level: explanationLevelSchema, text: z.string().min(1) })
  .strict()
export type Explanation = z.infer<typeof explanationSchema>

export const hintSchema = z
  .object({ order: z.number().int().positive(), text: z.string().min(1) })
  .strict()
export type Hint = z.infer<typeof hintSchema>

export const hintLadderSchema = z
  .array(hintSchema)
  .refine((hints) => hints.every((hint, index) => hint.order === index + 1), {
    message: 'hintLadder orders must run 1..n in sequence',
  })

export const misconceptionSchema = z
  .object({ trigger: z.string().min(1), correction: z.string().min(1) })
  .strict()
export type Misconception = z.infer<typeof misconceptionSchema>

export const checkSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    acceptanceCriteria: z.array(z.string().min(1)).min(1),
    passFeedback: z.string().min(1),
    failFeedback: z.string().min(1),
  })
  .strict()
export type Check = z.infer<typeof checkSchema>

export const failurePlaybookSchema = z
  .object({
    scenarioId: z.string().regex(/^(SWE|BIZ)-\d{2}$/),
    failureMode: z.string().min(1),
    correctMove: z.string().min(1),
  })
  .strict()
export type FailurePlaybook = z.infer<typeof failurePlaybookSchema>

export const bakedChunkSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    embedding: z.array(z.number()).nullable(),
  })
  .strict()
export type BakedChunk = z.infer<typeof bakedChunkSchema>

export const celebrationSchema = z
  .object({
    headline: z.string().min(1),
    recap: z.string().min(1),
    unlocked: z.string().min(1),
  })
  .strict()
export type Celebration = z.infer<typeof celebrationSchema>

export const bakedLessonSchema = z
  .object({
    lesson: rawLessonSchema,
    concept: z.string().min(1),
    prerequisites: z.array(z.string()),
    bloom: bloomLevelSchema,
    explanations: z.array(explanationSchema).min(1),
    examples: z.array(z.string().min(1)),
    hintLadder: hintLadderSchema,
    misconceptions: z.array(misconceptionSchema),
    checks: z.array(checkSchema).min(1),
    practice: z.array(practiceQuestionSchema).optional(),
    pedagogyRules: z.array(z.string().min(1)).min(1),
    failurePlaybooks: z.array(failurePlaybookSchema).min(1),
    chunks: z.array(bakedChunkSchema).min(1),
    celebration: celebrationSchema,
  })
  .strict()
export type BakedLesson = z.infer<typeof bakedLessonSchema>

export function parseBakedLesson(data: unknown): BakedLesson {
  return bakedLessonSchema.parse(data)
}
