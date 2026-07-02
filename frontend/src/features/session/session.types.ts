export type TrackId = 'applied-ml' | 'llms-genai' | 'ml-systems'

export type CodingExperience = 'never' | 'a-little' | 'comfortable'

export type SessionUser = {
  name: string
  email: string
  track: TrackId
  weeklyHours: string
  codingExperience: string
  why: string
}

export type SessionProgress = {
  level: number
  levelPct: number
  week: number
  lessonIndex: number
  lessonStep: number
  masteredConcepts: string[]
}

export type SessionStreak = {
  days: number
  lastActive: string
}

export type SessionIdentity = {
  climberNo: number
  ascentStart: string
}
