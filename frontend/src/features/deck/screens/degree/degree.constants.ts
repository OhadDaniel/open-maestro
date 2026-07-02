import type { TrackId } from '../../../session/session.types'

export type TrackOption = {
  id: TrackId
  icon: string
  title: string
  sub: string
}

export const TRACK_OPTIONS: TrackOption[] = [
  {
    id: 'applied-ml',
    icon: 'cpu-chip-01',
    title: 'Applied Machine Learning',
    sub: 'Train and ship models that learn from data',
  },
  {
    id: 'llms-genai',
    icon: 'magic-wand-01',
    title: 'LLMs & Generative AI',
    sub: 'Build with language models, agents and RAG',
  },
  {
    id: 'ml-systems',
    icon: 'lightning-01',
    title: 'ML Systems & Infrastructure',
    sub: 'Serve models at scale, in production',
  },
]

export const DEGREE_COPY = {
  eyebrow: 'Associate of Applied Science',
  title: 'AI Engineering',
  body:
    'A career-ready degree in building real AI systems — from Python foundations to shipping models people rely on. Learn by doing, with your tutor beside you the whole way.',
  pickFocus: 'Pick your focus',
  changeAnytime: 'Change it anytime',
  cta: 'Commit to this degree',
  footnote: 'This becomes your path. Your tutor is tailored to your focus.',
} as const
