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

describe('affectObserver confused detection', () => {
  it('triggers on clear confusion phrases', () => {
    expect(affectObserver("i don't get it", []).state).toBe('confused')
    expect(affectObserver("i'm lost", []).state).toBe('confused')
    expect(affectObserver('lost me', []).state).toBe('confused')
  })

  it('does NOT trigger on bare "what?" — rhetorical or curious use', () => {
    expect(affectObserver('what?', []).state).not.toBe('confused')
    expect(affectObserver('what? cool', []).state).not.toBe('confused')
  })
})
