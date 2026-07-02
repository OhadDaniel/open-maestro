import { describe, expect, it } from 'vitest'
import { WRITING_YOUR_FIRST_PROGRAM } from '../content/samples/writing-your-first-program'
import { emptyProfile, withGoal, withName } from '../memory/learner-profile'
import { createSession, setMode } from './session'
import { buildTutorSystemPrompt } from './tutor-rules'

const baked = WRITING_YOUR_FIRST_PROGRAM
const session = createSession(baked.lesson.id)
const profile = emptyProfile()

describe('buildTutorSystemPrompt', () => {
  it('includes the grounding base and the concept', () => {
    const prompt = buildTutorSystemPrompt(baked, session, profile)
    expect(prompt).toContain('Use ONLY the lesson material')
    expect(prompt).toContain(baked.concept)
  })

  it('includes the lesson plan and progression rules', () => {
    const prompt = buildTutorSystemPrompt(baked, session, profile)
    expect(prompt).toContain('Lesson plan')
    expect(prompt).toContain(baked.lesson.masteryOutcomes[0])
    expect(prompt).toContain('Keeping the lesson moving')
  })

  it('assumes no prior knowledge and keeps answers short', () => {
    const prompt = buildTutorSystemPrompt(baked, session, profile)
    expect(prompt).toContain('Assume the student knows nothing in advance')
    expect(prompt).toContain('Keep answers short and clean')
  })

  it('carries the learner memory (name and goal) from turn one', () => {
    const known = withGoal(withName(emptyProfile(), 'Liz'), 'become an AI engineer')
    const prompt = buildTutorSystemPrompt(baked, session, known)
    expect(prompt).toContain('Name: Liz')
    expect(prompt).toContain('Goal: become an AI engineer')
  })

  it('injects practice rules including the three question types', () => {
    const prompt = buildTutorSystemPrompt(baked, setMode(session, 'practice'), profile)
    expect(prompt).toContain('why this practice matters')
    expect(prompt).toContain('multiple-choice')
  })

  it('never-reveal rule appears in challenge mode', () => {
    const prompt = buildTutorSystemPrompt(baked, setMode(session, 'challenge'), profile)
    expect(prompt).toContain('Never reveal the answer')
  })

  it('keeps the exam short in exam mode', () => {
    const prompt = buildTutorSystemPrompt(baked, setMode(session, 'exam'), profile)
    expect(prompt).toContain('Keep the exam short')
  })

  it('includes the lesson-specific pedagogy rules', () => {
    const prompt = buildTutorSystemPrompt(baked, session, profile)
    expect(prompt).toContain(baked.pedagogyRules[0])
  })
})
