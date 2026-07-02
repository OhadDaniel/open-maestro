export const RING_CIRCUMFERENCE = 703.7
export const DOWNLOAD_DURATION = 5200

export const CHECKLIST = [
  { threshold: 34, label: 'Model weights' },
  { threshold: 66, label: 'Tokenizer & tools' },
  { threshold: 93, label: 'Tuned to your focus' },
] as const

export function statusFor(percent: number, trackLabel: string): string {
  if (percent < 15) {
    return 'Waking your tutor…'
  }
  if (percent < 40) {
    return 'Downloading the model to your device…'
  }
  if (percent < 70) {
    return 'Unpacking 3.8B parameters…'
  }
  if (percent < 93) {
    return `Tuning to your focus — ${trackLabel}…`
  }
  if (percent < 100) {
    return 'Almost yours…'
  }
  return 'Your tutor is ready.'
}

export const DOWNLOAD_COPY = {
  kicker: 'Bringing your tutor to your device',
  footer: 'Runs entirely on your device · Works offline',
  cta: 'Meet your tutor',
} as const
