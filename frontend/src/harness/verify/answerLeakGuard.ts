import type { BakedLesson } from '../../content/baked.types'
import type { TutorMode, TutorSession } from '../../content/session.types'
import type { GuardResult } from '../types'

const GUARDED_MODES: readonly TutorMode[] = ['challenge', 'exam']
const CODE_FENCE = /```/
const STRICTER_DIRECTIVE =
  'STOP — your draft contains the solution. Rewrite it with no part of the final answer: no completed line, no near-complete code, no fill-in-the-blank that spells it out. Give exactly one hint — the next rung on the ladder — and let the student write the code themselves.'

export const WITHHOLD_FALLBACK =
  "I could just tell you — but you're one honest attempt away from owning this. Look again at the part the last hint pointed to, give it a try, and I'm right here when you've run it."

export function isGuardedMode(mode: TutorMode): boolean {
  return GUARDED_MODES.includes(mode)
}

export function answerLeakGuard(
  draft: string,
  session: TutorSession,
  _lesson: BakedLesson,
): GuardResult {
  if (!isGuardedMode(session.mode)) {
    return { tripped: false }
  }
  if (CODE_FENCE.test(draft)) {
    return { tripped: true, directive: STRICTER_DIRECTIVE }
  }
  return { tripped: false }
}
