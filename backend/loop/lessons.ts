import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { BakedLesson } from '../../frontend/src/content/baked.types'
import { bakedLessonSchema } from '../../frontend/src/content/baked.types'

const CONTENT_DIR = fileURLToPath(
  new URL('../../frontend/public/content/py101/', import.meta.url),
)
const JSON_SUFFIX = '.json'

export function loadAllLessons(): BakedLesson[] {
  return readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith(JSON_SUFFIX))
    .sort()
    .map((name) => bakedLessonSchema.parse(JSON.parse(readFileSync(`${CONTENT_DIR}${name}`, 'utf8'))))
}

export const ALL_LESSONS: BakedLesson[] = loadAllLessons()
