import type { BakedLesson } from '../content/baked.types'
import type { TutorProvider } from './provider'
import type { ProviderRequest, ProviderStreamEvent } from './provider.types'

export const OPENING_BOOTSTRAP = '(Begin the lesson now with your first message.)'

const DELTA_DELAY_MS = 22

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function firstSentences(text: string, count: number): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .slice(0, count)
    .join(' ')
    .trim()
}

function pickExplanation(baked: BakedLesson, level: 'eli5' | 'standard'): string {
  const found = baked.explanations.find((entry) => entry.level === level)
  const chosen = found ?? baked.explanations[0]
  return chosen ? firstSentences(chosen.text, 2) : baked.concept
}

function openingText(baked: BakedLesson, name: string | null): string {
  const greeting = name === null ? 'Hi there —' : `Hi ${name} —`
  const question = baked.checks[0]?.prompt ?? 'Ready to dive in?'
  return `${greeting} welcome to "${baked.lesson.title}".\n\n${pickExplanation(baked, 'eli5')}\n\n${question}`
}

function replyText(baked: BakedLesson): string {
  const hint = baked.hintLadder[0]
  const body = pickExplanation(baked, 'standard')
  return hint === undefined ? body : `${body}\n\nHere's a nudge: ${hint.text}`
}

const OUTPUT_MARKER = 'Output:'

function errorLine(text: string): string {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
  const named = [...lines].reverse().find((line) => /^[A-Za-z_][\w.]*Error\b/.test(line))
  return named ?? lines[lines.length - 1] ?? text.trim()
}

function runReactionText(message: string): string {
  const markerAt = message.indexOf(OUTPUT_MARKER)
  const output = markerAt < 0 ? '' : message.slice(markerAt + OUTPUT_MARKER.length).trim()
  if (/traceback|error/i.test(output)) {
    return `Let's read that error together — Python is telling you: "${errorLine(output)}". That's a clue, not a failure. Want to look at the line it points to and try again?`
  }
  if (output.length === 0 || output === '(no output)') {
    return `Your code ran, but nothing printed yet. Add a print(...) so you can see what it's doing, then run it again.`
  }
  return `Nice — your program printed:\n${output}\n\nThat's your code doing real work. Want to tweak it and run it again?`
}

export class OfflineTutorProvider implements TutorProvider {
  private readonly baked: BakedLesson
  private readonly name: string | null

  constructor(baked: BakedLesson, name: string | null) {
    this.baked = baked
    this.name = name
  }

  async *streamMessage(request: ProviderRequest): AsyncIterable<ProviderStreamEvent> {
    const last = request.messages[request.messages.length - 1]
    const lastContent = last?.content ?? ''
    const text =
      lastContent === OPENING_BOOTSTRAP
        ? openingText(this.baked, this.name)
        : lastContent.includes(OUTPUT_MARKER)
          ? runReactionText(lastContent)
          : replyText(this.baked)
    const tokens = text.match(/\S+\s*|\n+/g) ?? [text]
    for (const token of tokens) {
      await delay(DELTA_DELAY_MS)
      yield { type: 'text_delta', text: token }
    }
    yield { type: 'message_stop', stopReason: 'stop' }
  }
}
