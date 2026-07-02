import { describe, expect, it } from 'vitest'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import { createSession, setMode, setName } from './session'
import { buildTutorSystemPrompt } from './tutor-rules'

const baked = WRITING_YOUR_FIRST_PROGRAM

describe('buildTutorSystemPrompt', () => {
  it('includes the grounding base and the concept', () => {
    const prompt = buildTutorSystemPrompt(baked, createSession(baked.lesson.id))
    expect(prompt).toContain('Teach using ONLY the information')
    expect(prompt).toContain(baked.concept)
  })

  it('assumes no prior knowledge and keeps answers short', () => {
    const prompt = buildTutorSystemPrompt(baked, createSession(baked.lesson.id))
    expect(prompt).toContain('Assume the student knows nothing in advance')
    expect(prompt).toContain('Keep answers short and clean')
  })

  it('honors the student name when set', () => {
    const session = setName(createSession(baked.lesson.id), 'Liz')
    expect(buildTutorSystemPrompt(baked, session)).toContain('Liz')
  })

  it('injects practice rules including the three question types', () => {
    const prompt = buildTutorSystemPrompt(baked, setMode(createSession(baked.lesson.id), 'practice'))
    expect(prompt).toContain('why this practice matters')
    expect(prompt).toContain('multiple-choice')
  })

  it('never-reveal rule appears in challenge mode', () => {
    const prompt = buildTutorSystemPrompt(baked, setMode(createSession(baked.lesson.id), 'challenge'))
    expect(prompt).toContain('Never reveal the answer')
  })

  it('keeps the exam short in exam mode', () => {
    const prompt = buildTutorSystemPrompt(baked, setMode(createSession(baked.lesson.id), 'exam'))
    expect(prompt).toContain('Keep the exam short')
  })

  it('includes the lesson-specific pedagogy rules', () => {
    const prompt = buildTutorSystemPrompt(baked, createSession(baked.lesson.id))
    expect(prompt).toContain(baked.pedagogyRules[0])
  })
})
