import type { BakedLesson } from './baked.types'
import { runtimeBakedLessonSchema } from './baked.types'

const CONTENT_BASE = '/content'

export async function loadBakedLesson(
  courseId: string,
  lessonSlug: string,
): Promise<BakedLesson> {
  const response = await fetch(`${CONTENT_BASE}/${courseId}/${lessonSlug}.json`)
  if (!response.ok) {
    throw new Error(`Lesson not found: ${courseId}/${lessonSlug}`)
  }
  const data: unknown = await response.json()
  return runtimeBakedLessonSchema.parse(data)
}
