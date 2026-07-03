export const BEAT1_GREETING =
  "Hey, I'm Maestro \u{1F44B} I'm a fully on-device AI tutor with one mission: world-class education, free, for everyone. A small team of visionaries built me — and a crew of AI researchers keeps training me to teach better every single night. You're not just taking a course; you're an early pioneer. What's your name?"

const BEAT2_TEMPLATE =
  "Great to meet you, {name}. Before we climb, I want to know who I'm climbing with. Tell me a bit about yourself — your background, your dream, and what brought you to this mountain."

export const BEAT3_FALLBACK =
  "That's exactly the kind of drive this mountain was made for."

export const BEAT3_TAIL =
  "I'll remember that — it's why we're here. One thing you should know about me: I run entirely on your device. Free, private, yours. Behind me works a team of AI research agents who study how I teach and make me better while you sleep. So if I stumble sometimes — patience, I'm literally getting smarter every night. Ready for your first climb?"

export const BEAT3_MAX_WORDS = 30

export const BEAT3_SYSTEM =
  'You are a warm AI tutor. A new student just described their background, dream, and reason for learning. Write exactly one sentence: warm, personal, referencing a specific concrete detail they mentioned. No questions. No advice. Maximum 30 words.'

export const LESSON0_HEADER = 'Lesson 0 · Getting to know you'
export const LESSON0_SUB = 'Your first lesson, before the climb'
export const LESSON0_CTA = 'Start your first climb'

export function formatBeat2(name: string): string {
  return BEAT2_TEMPLATE.replace('{name}', name)
}

export function guardBeat3Response(text: string): string {
  const cleaned = text.trim()
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length
  if (cleaned.length === 0 || wordCount > BEAT3_MAX_WORDS || cleaned.includes('?')) {
    return BEAT3_FALLBACK
  }
  return cleaned
}

export function buildBeat3Bubble(modelText: string): string {
  return guardBeat3Response(modelText) + '\n\n' + BEAT3_TAIL
}
