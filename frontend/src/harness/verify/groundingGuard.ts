import type { BakedLesson } from '../../content/baked.types'
import type { GuardResult } from '../types'

const MIN_DRAFT_LENGTH = 40
const KEYWORD = /[a-z]{5,}/g
const STEER_BACK =
  'That drifted off the lesson. Give a one-sentence answer, then bring the student back to the current step.'

function keywords(text: string): Set<string> {
  return new Set(text.toLowerCase().match(KEYWORD) ?? [])
}

export function groundingGuard(draft: string, lesson: BakedLesson): GuardResult {
  if (draft.length < MIN_DRAFT_LENGTH) {
    return { tripped: false }
  }
  const lessonWords = keywords(`${lesson.concept} ${lesson.chunks.map((chunk) => chunk.text).join(' ')}`)
  const draftWords = keywords(draft)
  for (const word of draftWords) {
    if (lessonWords.has(word)) {
      return { tripped: false }
    }
  }
  return { tripped: true, directive: STEER_BACK }
}
