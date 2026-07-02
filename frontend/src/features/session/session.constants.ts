import type {
  SessionIdentity,
  SessionProgress,
  SessionStreak,
  SessionUser,
  TrackId,
} from './session.types'

export const TRACK_LABEL: Record<TrackId, string> = {
  'applied-ml': 'Applied ML',
  'llms-genai': 'LLMs & Generative AI',
  'ml-systems': 'ML Systems & Infrastructure',
}

export const INITIAL_USER: SessionUser = {
  name: 'Ray',
  email: '',
  track: 'applied-ml',
  weeklyHours: '',
  codingExperience: '',
  why: '',
}

export const INITIAL_PROGRESS: SessionProgress = {
  level: 3,
  levelPct: 35,
  week: 3,
  lessonIndex: 4,
  lessonStep: 2,
  masteredConcepts: [
    'print()',
    'comments',
    'running code',
    'variables',
    'strings',
    'numbers',
    'naming',
    'functions',
    'parameters',
    'return values',
  ],
}

export const INITIAL_STREAK: SessionStreak = {
  days: 12,
  lastActive: '2026-07-02',
}

export const INITIAL_IDENTITY: SessionIdentity = {
  climberNo: 4213,
  ascentStart: 'July 2, 2026',
}
