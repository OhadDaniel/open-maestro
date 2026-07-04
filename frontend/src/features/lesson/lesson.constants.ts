export const LESSON_LABELS = {
  placeholder: 'Message Maestro…',
  send: 'Send',
  thinking: 'Maestro is typing…',
  understood: 'I understand',
  progressRail: 'Your progress',
} as const

export function greetingFor(name: string | null, lessonTitle: string): string {
  if (name) {
    return `Welcome back, ${name}. Let's take on "${lessonTitle}" — ready when you are.`
  }
  return `Hi, I'm Maestro. Let's work through "${lessonTitle}" together, one small step at a time.`
}
