export const ACCOUNT_COPY = {
  namePrompt: 'What should I call you?',
  namePlaceholder: 'Your name',
  emailPrompt: 'Where should I save your progress?',
  emailPlaceholder: 'you@email.com',
  cta: 'Continue',
  trust: "Everything stays on your device. We'll never share it.",
} as const

export const WAYPOINTS: ReadonlyArray<{ left: string; top: string }> = [
  { left: '53%', top: '73%' },
  { left: '58%', top: '63%' },
  { left: '62%', top: '53%' },
  { left: '66%', top: '43%' },
  { left: '70.5%', top: '34%' },
]
