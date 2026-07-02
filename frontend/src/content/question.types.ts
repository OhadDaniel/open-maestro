import { z } from 'zod'

export const codingQuestionSchema = z
  .object({
    kind: z.literal('coding'),
    prompt: z.string().min(1),
    starterCode: z.string(),
    acceptanceCriteria: z.array(z.string().min(1)).min(1),
  })
  .strict()
export type CodingQuestion = z.infer<typeof codingQuestionSchema>

export const openQuestionSchema = z
  .object({
    kind: z.literal('open'),
    prompt: z.string().min(1),
    rubric: z.array(z.string().min(1)).min(1),
  })
  .strict()
export type OpenQuestion = z.infer<typeof openQuestionSchema>

export const closedQuestionSchema = z
  .object({
    kind: z.literal('closed'),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    correctIndex: z.number().int().nonnegative(),
    explanation: z.string().min(1),
  })
  .strict()
export type ClosedQuestion = z.infer<typeof closedQuestionSchema>

export const practiceQuestionSchema = z
  .union([codingQuestionSchema, openQuestionSchema, closedQuestionSchema])
  .refine((question) => question.kind !== 'closed' || question.correctIndex < question.options.length, {
    message: 'closed question correctIndex is out of range',
  })
export type PracticeQuestion = z.infer<typeof practiceQuestionSchema>

export const PRACTICE_QUESTION_KINDS = ['coding', 'open', 'closed'] as const
export type PracticeQuestionKind = (typeof PRACTICE_QUESTION_KINDS)[number]
