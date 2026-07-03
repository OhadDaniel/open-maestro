import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { RawLesson } from '../../frontend/src/content/lesson.types'

const CONTENT_DIR = fileURLToPath(
  new URL('../../frontend/public/content/py101/', import.meta.url),
)

function rawFromBaked(slug: string): RawLesson {
  const baked = JSON.parse(readFileSync(`${CONTENT_DIR}${slug}.json`, 'utf8'))
  return baked.lesson as RawLesson
}

export const HEAD_ENTRIES = [
  { slug: 'welcome-to-py101', lesson: rawFromBaked('welcome-to-py101') },
  { slug: 'writing-your-first-program', lesson: rawFromBaked('writing-your-first-program') },
  { slug: 'unlocking-print-power-ups', lesson: rawFromBaked('unlocking-print-power-ups') },
]
