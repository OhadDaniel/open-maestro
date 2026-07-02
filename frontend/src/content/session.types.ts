import { z } from 'zod'

export const tutorModeSchema = z.enum([
  'explain',
  'practice',
  'challenge',
  'exam',
])
export type TutorMode = z.infer<typeof tutorModeSchema>
export const TUTOR_MODES = tutorModeSchema.options

export const studentPrefsSchema = z
  .object({ name: z.string().nullable() })
  .strict()
export type StudentPrefs = z.infer<typeof studentPrefsSchema>

export const lessonProgressSchema = z
  .object({
    lessonId: z.string().min(1),
    checksPassed: z.array(z.string()),
    masteredOutcomes: z.array(z.string()),
    wrapOffered: z.boolean(),
    wrapDeclined: z.boolean(),
    completed: z.boolean(),
  })
  .strict()
export type LessonProgress = z.infer<typeof lessonProgressSchema>

export const tutorSessionSchema = z
  .object({
    lessonId: z.string().min(1),
    mode: tutorModeSchema,
    prefs: studentPrefsSchema,
    progress: lessonProgressSchema,
  })
  .strict()
export type TutorSession = z.infer<typeof tutorSessionSchema>
