import { z } from 'zod'

export const rawLessonSchema = z
  .object({
    id: z.string().min(1),
    courseId: z.string().min(1),
    weekId: z.string().min(1),
    title: z.string().min(1),
    masteryOutcomes: z.array(z.string().min(1)).min(1),
    tutorInstructions: z.string().nullable(),
  })
  .strict()

export type RawLesson = z.infer<typeof rawLessonSchema>
export type MasteryOutcome = string
