export type LevelNodeState = 'done' | 'current' | 'locked'

export type LevelNode = {
  level: string
  title: string
  sub: string
  left: string
  top: string
  lockIcon?: 'lock-03' | 'diamond-01'
}

export const HOME_LEVELS: readonly LevelNode[] = [
  { level: 'Level 1', title: 'Foundations', sub: 'Foundations', left: '15%', top: '86.2%' },
  { level: 'Level 2', title: 'Python basics', sub: 'Python basics', left: '35%', top: '68.4%' },
  { level: 'Level 3', title: 'Functions & input', sub: 'Functions & input', left: '54.5%', top: '51%' },
  { level: 'Level 4', title: 'Data & loops', sub: 'Data & loops', left: '72.5%', top: '33.6%', lockIcon: 'lock-03' },
  { level: 'Summit', title: 'First model', sub: 'First model', left: '88%', top: '15.8%', lockIcon: 'diamond-01' },
]

export const TRAIL_GHOST_PATH = 'M545 388 C 630 325 650 315 725 255 C 800 200 815 185 880 120'
export const TRAIL_DONE_PATH = 'M150 655 C 250 620 280 560 350 520 C 440 480 470 445 545 388'

export type SkyStar = {
  x: number
  y: number
  concept: string
  week: string
  weekIndex: number
}

export const SKY_STARS: readonly SkyStar[] = [
  { x: 540, y: 170, concept: 'print()', week: 'Week 1', weekIndex: 0 },
  { x: 585, y: 120, concept: 'comments', week: 'Week 1', weekIndex: 0 },
  { x: 635, y: 168, concept: 'running code', week: 'Week 1', weekIndex: 0 },
  { x: 700, y: 95, concept: 'variables', week: 'Week 2', weekIndex: 1 },
  { x: 755, y: 140, concept: 'strings', week: 'Week 2', weekIndex: 1 },
  { x: 815, y: 88, concept: 'numbers', week: 'Week 2', weekIndex: 1 },
  { x: 870, y: 132, concept: 'naming', week: 'Week 2', weekIndex: 1 },
  { x: 925, y: 175, concept: 'functions', week: 'Week 3', weekIndex: 2 },
  { x: 957, y: 110, concept: 'parameters', week: 'Week 3', weekIndex: 2 },
  { x: 988, y: 160, concept: 'return values', week: 'Week 3', weekIndex: 2 },
]

export const SKY_CONSTELLATIONS: readonly (readonly number[])[] = [
  [0, 1, 2],
  [3, 4, 5, 6],
]

export function homeGreeting(name: string): string {
  const first = name.trim().split(' ')[0] || 'Ray'
  return `Back at it, ${first}`
}

export const HOME_COPY = {
  skyCaption: 'Your sky · 10 concepts mastered',
  resumeKicker: 'Pick up where you left off',
  continue: 'Continue',
} as const

export function levelState(index: number, currentWeekIndex: number): LevelNodeState {
  if (index < currentWeekIndex) {
    return 'done'
  }
  if (index === currentWeekIndex) {
    return 'current'
  }
  return 'locked'
}
