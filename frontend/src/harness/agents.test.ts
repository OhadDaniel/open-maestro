import { describe, expect, it } from 'vitest'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import type { TutorSession } from '../content/session.types'
import { emptyProfile } from '../memory/learner-profile'
import { createSession } from '../tutor/session'
import { memoryCurator } from './remember/memoryCurator'
import { affectObserver } from './sense/affectObserver'
import { masteryTracer } from './sense/masteryTracer'
import { misconceptionDiagnoser } from './sense/misconceptionDiagnoser'
import { answerLeakGuard } from './verify/answerLeakGuard'
import { groundingGuard } from './verify/groundingGuard'

const lesson = WRITING_YOUR_FIRST_PROGRAM
const lessonId = lesson.lesson.id

function sessionWith(overrides: Partial<TutorSession>): TutorSession {
  return { ...createSession(lessonId), ...overrides }
}

describe('affectObserver', () => {
  it('detects states from cues, else neutral', () => {
    expect(affectObserver("honestly i'm lost", []).state).toBe('confused')
    expect(affectObserver('ugh this is stupid', []).state).toBe('frustrated')
    expect(affectObserver('WHY WONT THIS WORK', []).state).toBe('frustrated')
    const neutral = affectObserver('here is my answer', [])
    expect(neutral.state).toBe('engaged')
    expect(neutral.confidence).toBe(0)
  })
})

describe('masteryTracer', () => {
  it('reports mastered when the lesson is completed, else unseen', () => {
    const done = masteryTracer(sessionWith({ progress: { lessonId, checksPassed: [], completed: true } }), lesson)
    expect(done.skills.every((skill) => skill.status === 'mastered')).toBe(true)
    const fresh = masteryTracer(sessionWith({}), lesson)
    expect(fresh.skills.every((skill) => skill.status === 'unseen')).toBe(true)
  })
})

describe('answerLeakGuard', () => {
  it('trips on a code block in challenge/exam, not in explain', () => {
    const draft = 'Here you go:\n```python\nprint("Hello")\n```'
    expect(answerLeakGuard(draft, sessionWith({ mode: 'challenge' }), lesson).tripped).toBe(true)
    expect(answerLeakGuard(draft, sessionWith({ mode: 'explain' }), lesson).tripped).toBe(false)
  })
})

describe('groundingGuard', () => {
  it('does not trip on short or on-lesson drafts', () => {
    expect(groundingGuard('ok', lesson).tripped).toBe(false)
    expect(groundingGuard("Let's use print to display output in Python together now.", lesson).tripped).toBe(false)
  })
})

describe('misconceptionDiagnoser', () => {
  it('does not match a plain message', () => {
    expect(misconceptionDiagnoser('hello there, ready to learn', lesson).matched).toBe(false)
  })
})

describe('memoryCurator', () => {
  it('returns the same profile when nothing durable is said', () => {
    const profile = emptyProfile()
    expect(memoryCurator('the weather is nice today', profile)).toBe(profile)
  })
})
