import { describe, expect, it } from 'vitest'
import { affectObserver } from './affectObserver'

describe('affectObserver confident detection', () => {
  it('triggers on explicit mastery claims', () => {
    const claims = [
      'i know this already',
      'I already know how this works',
      'too easy for me',
      "i've done this before",
      'ive done this in school',
    ]
    for (const text of claims) {
      expect(affectObserver(text, []).state, text).toBe('confident')
    }
  })

  it('does NOT trigger on vague understanding phrases', () => {
    const vague = [
      'got it',
      "i'm feeling like i got it",
      'obviously',
      'this is easy',
      'i understand now',
      "i think i understand",
      'yeah i get it',
    ]
    for (const text of vague) {
      expect(affectObserver(text, []).state, text).not.toBe('confident')
    }
  })
})
