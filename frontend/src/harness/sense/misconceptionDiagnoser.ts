import type { BakedLesson } from '../../content/baked.types'
import { NO_MISCONCEPTION } from '../constants'
import type { MisconceptionSignal } from '../types'

const MIN_SNIPPET_LENGTH = 5
const CODE_HINT = /[()"'*+/=%]/

function codeSnippets(trigger: string): string[] {
  const afterExample = trigger.split(/e\.g\.?/i)[1] ?? trigger
  return afterExample
    .split(/[\n,;]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= MIN_SNIPPET_LENGTH && CODE_HINT.test(part))
}

export function misconceptionDiagnoser(
  userMessage: string,
  lesson: BakedLesson,
): MisconceptionSignal {
  const text = userMessage.replace(/\s+/g, ' ').trim()
  if (text.length === 0) {
    return NO_MISCONCEPTION
  }
  for (const [index, misconception] of lesson.misconceptions.entries()) {
    const snippets = codeSnippets(misconception.trigger)
    if (snippets.some((snippet) => text.includes(snippet))) {
      return { matched: true, id: String(index), remediation: misconception.correction }
    }
  }
  return NO_MISCONCEPTION
}
