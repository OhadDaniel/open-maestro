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

export class OfflineTutorProvider implements TutorProvider {
  private readonly baked: BakedLesson
  private readonly name: string | null

  constructor(baked: BakedLesson, name: string | null) {
    this.baked = baked
    this.name = name
  }

  async *streamMessage(request: ProviderRequest): AsyncIterable<ProviderStreamEvent> {
    const last = request.messages[request.messages.length - 1]
    const isOpening = last !== undefined && last.content === OPENING_BOOTSTRAP
    const text = isOpening ? openingText(this.baked, this.name) : replyText(this.baked)
    const tokens = text.match(/\S+\s*|\n+/g) ?? [text]
    for (const token of tokens) {
      await delay(DELTA_DELAY_MS)
      yield { type: 'text_delta', text: token }
    }
    yield { type: 'message_stop', stopReason: 'stop' }
  }
}
