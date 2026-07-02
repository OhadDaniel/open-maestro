export const CELEBRATE_COPY = {
  eyebrow: 'Day 1 · Your climb begins',
  title: 'Welcome to Maestro.',
  cta: 'Start my first lesson',
} as const

export function celebrateSubhead(trackLabel: string): string {
  return `You're enrolled in AI Engineering, focused on ${trackLabel}. Your tutor lives on your device and the whole path is ahead of you.`
}

export function serialLine(climberNo: number, ascentStart: string): string {
  return `Climber No. ${climberNo.toLocaleString()} · Ascent began ${ascentStart}`
}
