import { describe, expect, it } from 'vitest'
import { parseBakedLesson, runtimeBakedLessonSchema } from './baked.types'
import { WRITING_YOUR_FIRST_PROGRAM } from './samples/writing-your-first-program'

describe('runtimeBakedLessonSchema (lenient load)', () => {
  it('applies defaults for an old-format lesson missing all three new fields', () => {
    const raw = { ...WRITING_YOUR_FIRST_PROGRAM } as Record<string, unknown>
    delete raw['openingLine']
    delete raw['bridgeFromPreviousLesson']
    delete raw['dialogueExemplars']
    const result = runtimeBakedLessonSchema.parse(raw)
    expect(result.openingLine).toBe('')
    expect(result.bridgeFromPreviousLesson).toBeNull()
    expect(result.dialogueExemplars).toEqual([])
  })

  it('passes a fully-formed new-format lesson through unchanged', () => {
    const result = runtimeBakedLessonSchema.parse(WRITING_YOUR_FIRST_PROGRAM)
    expect(result.openingLine).toBe(WRITING_YOUR_FIRST_PROGRAM.openingLine)
    expect(result.bridgeFromPreviousLesson).toBe(WRITING_YOUR_FIRST_PROGRAM.bridgeFromPreviousLesson)
    expect(result.dialogueExemplars).toEqual(WRITING_YOUR_FIRST_PROGRAM.dialogueExemplars)
  })

  it('applies null default for missing bridgeFromPreviousLesson only', () => {
    const raw = { ...WRITING_YOUR_FIRST_PROGRAM } as Record<string, unknown>
    delete raw['bridgeFromPreviousLesson']
    const result = runtimeBakedLessonSchema.parse(raw)
    expect(result.bridgeFromPreviousLesson).toBeNull()
    expect(result.openingLine).toBe(WRITING_YOUR_FIRST_PROGRAM.openingLine)
  })
})

describe('parseBakedLesson (strict — for baking)', () => {
  it('accepts a fully-formed lesson', () => {
    expect(() => parseBakedLesson(WRITING_YOUR_FIRST_PROGRAM)).not.toThrow()
  })

  it('rejects a lesson missing openingLine', () => {
    const raw = { ...WRITING_YOUR_FIRST_PROGRAM } as Record<string, unknown>
    delete raw['openingLine']
    expect(() => parseBakedLesson(raw)).toThrow()
  })

  it('rejects a lesson missing dialogueExemplars', () => {
    const raw = { ...WRITING_YOUR_FIRST_PROGRAM } as Record<string, unknown>
    delete raw['dialogueExemplars']
    expect(() => parseBakedLesson(raw)).toThrow()
  })
})
