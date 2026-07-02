import { z } from 'zod'

export const lessonStatusSchema = z.enum([
  'locked',
  'available',
  'in_progress',
  'completed',
])
export type LessonStatus = z.infer<typeof lessonStatusSchema>
export const LESSON_STATUSES = lessonStatusSchema.options

export const lessonNodeSchema = z
  .object({ id: z.string().min(1), title: z.string().min(1) })
  .strict()
export type LessonNode = z.infer<typeof lessonNodeSchema>

export const weekNodeSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    lessons: z.array(lessonNodeSchema).min(1),
  })
  .strict()
export type WeekNode = z.infer<typeof weekNodeSchema>

export const courseNodeSchema = z
  .object({
    id: z.string().min(1),
    code: z.string().min(1),
    title: z.string().min(1),
    weeks: z.array(weekNodeSchema).min(1),
  })
  .strict()
export type CourseNode = z.infer<typeof courseNodeSchema>

export const degreeCatalogSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    courses: z.array(courseNodeSchema).min(1),
  })
  .strict()
export type DegreeCatalog = z.infer<typeof degreeCatalogSchema>
