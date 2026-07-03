import { describe, expect, it } from 'vitest'
import {
  BEAT1_GREETING,
  BEAT3_FALLBACK,
  BEAT3_MAX_WORDS,
  BEAT3_TAIL,
  buildBeat3Bubble,
  formatBeat2,
  guardBeat3Response,
} from './lesson0.constants'

describe('guardBeat3Response', () => {
  it('passes a clean short sentence through unchanged', () => {
    const input = 'That ambition for a career switch is rare and inspiring.'
    expect(guardBeat3Response(input)).toBe(input)
  })

  it('falls back when response contains a question mark', () => {
    expect(guardBeat3Response('Ready to code?')).toBe(BEAT3_FALLBACK)
    expect(guardBeat3Response('Is that right? Great.')).toBe(BEAT3_FALLBACK)
  })

  it('falls back when response exceeds the word limit', () => {
    const long = Array.from({ length: BEAT3_MAX_WORDS + 1 }, () => 'word').join(' ')
    expect(guardBeat3Response(long)).toBe(BEAT3_FALLBACK)
  })

  it('passes a response at exactly the word limit', () => {
    const exact = Array.from({ length: BEAT3_MAX_WORDS }, () => 'word').join(' ')
    expect(guardBeat3Response(exact)).toBe(exact)
  })

  it('falls back when response is empty', () => {
    expect(guardBeat3Response('')).toBe(BEAT3_FALLBACK)
    expect(guardBeat3Response('   ')).toBe(BEAT3_FALLBACK)
  })
})

describe('formatBeat2', () => {
  it('slots the name into the greeting template', () => {
    const result = formatBeat2('Dana')
    expect(result).toContain('Dana')
    expect(result).not.toContain('{name}')
  })

  it('uses whatever name string is provided verbatim', () => {
    expect(formatBeat2('Sam')).toContain('Sam')
  })
})

describe('buildBeat3Bubble', () => {
  it('returns guarded model text followed by the tail', () => {
    const modelText = 'That drive to switch careers is exactly what this climb demands.'
    const result = buildBeat3Bubble(modelText)
    expect(result).toContain(modelText)
    expect(result).toContain(BEAT3_TAIL)
  })

  it('uses the fallback when model text fails the guard', () => {
    const result = buildBeat3Bubble('Is that right?')
    expect(result).toContain(BEAT3_FALLBACK)
    expect(result).not.toContain('Is that right?')
    expect(result).toContain(BEAT3_TAIL)
  })

  it('uses the fallback when model text is empty', () => {
    const result = buildBeat3Bubble('')
    expect(result).toContain(BEAT3_FALLBACK)
    expect(result).toContain(BEAT3_TAIL)
  })
})

describe('beat progression constants', () => {
  it('BEAT1_GREETING asks for the student name', () => {
    expect(BEAT1_GREETING).toContain("What's your name?")
  })

  it('BEAT3_TAIL ends with a question inviting the first lesson', () => {
    expect(BEAT3_TAIL).toContain('Ready for your first climb?')
  })
})
