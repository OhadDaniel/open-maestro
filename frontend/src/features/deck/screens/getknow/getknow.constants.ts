export type GetKnowField = 'why' | 'weeklyHours' | 'codingExperience'

export type GetKnowOption = {
  title: string
  sub: string
  echo: string
  value: string
}

export type GetKnowQuestion = {
  field: GetKnowField
  prompt: string
  columns: 1 | 2
  options: GetKnowOption[]
}

export const GETKNOW_QUESTIONS: readonly GetKnowQuestion[] = [
  {
    field: 'why',
    prompt: 'Before we climb — what brings you to the mountain?',
    columns: 2,
    options: [
      { title: 'Switching careers', sub: 'Time for something new', echo: 'Career switch', value: 'switching careers' },
      { title: 'Building my own ideas', sub: 'I want to ship things', echo: 'Building own ideas', value: 'building my own ideas' },
      { title: 'Leveling up at work', sub: 'AI is coming to my job', echo: 'Leveling up at work', value: 'leveling up at work' },
      { title: 'Pure curiosity', sub: 'I want to understand it', echo: 'Pure curiosity', value: 'pure curiosity' },
    ],
  },
  {
    field: 'weeklyHours',
    prompt: 'How much time can you give each week?',
    columns: 1,
    options: [
      { title: '2–3 hours', sub: 'A steady pace', echo: '2–3 hrs a week', value: '2-3' },
      { title: '5–7 hours', sub: 'The classic climb', echo: '5–7 hrs a week', value: '5-7' },
      { title: '10+ hours', sub: 'A fast ascent', echo: '10+ hrs a week', value: '10+' },
    ],
  },
  {
    field: 'codingExperience',
    prompt: 'Have you written code before?',
    columns: 1,
    options: [
      { title: 'Never', sub: "We'll start from zero", echo: 'starting from zero', value: 'never' },
      { title: 'A little', sub: 'Tutorials and copy-paste', echo: 'a little code before', value: 'a-little' },
      { title: 'Comfortable', sub: "I'm here for the AI part", echo: 'comfortable coding', value: 'comfortable' },
    ],
  },
]

export const GETKNOW_FEATURES = [
  { icon: 'message-chat-circle', tint: 'rgba(166,178,247,.14)', color: 'var(--lavender)', title: 'Lessons are conversations', sub: 'You talk it through with your tutor — no lecture videos.' },
  { icon: 'cpu-chip-01', tint: 'rgba(206,245,133,.13)', color: 'var(--accent)', title: 'Yours, on your device', sub: 'Your tutor runs locally — offline, private, always there.' },
  { icon: 'route', tint: 'rgba(255,139,98,.14)', color: 'var(--sunset)', title: 'A path that adapts', sub: 'Your answers shape every week of the climb.' },
] as const

export const GETKNOW_COPY = {
  cta: 'Take me to my summit',
  footnote: 'Lesson 0 complete · Your path is set',
  headerTitle: 'Lesson 0 · Getting to know you',
  headerSub: 'Your first lesson, before the climb',
  autoAdvanceMs: 430,
} as const

export function wrapTitle(name: string): string {
  const first = name.trim().split(' ')[0] || 'there'
  return `Thanks, ${first} — here's how this works.`
}

export function questionTitle(prompt: string, name: string): string {
  const first = name.trim().split(' ')[0]
  if (prompt.startsWith('Before we climb') && first) {
    return `Before we climb, ${first} — what brings you to the mountain?`
  }
  return prompt
}
