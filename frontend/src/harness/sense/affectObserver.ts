import type { ProviderMessage } from '../../ai/provider.types'
import { NEUTRAL_AFFECT } from '../constants'
import type { AffectSignal } from '../types'

const CUE_CONFIDENCE = 0.7
const MIN_CAPS_LETTERS = 4

type CueGroup = { state: AffectSignal['state']; phrases: readonly string[] }

const CUE_GROUPS: readonly CueGroup[] = [
  {
    state: 'frustrated',
    phrases: ['this is stupid', 'ugh', 'i give up', 'nothing works', 'forget it', 'hate this', 'so annoying', "why won't", 'why wont'],
  },
  {
    state: 'confused',
    phrases: ["i don't get it", 'i dont get it', "i'm lost", 'im lost', 'confused', 'what?', 'no idea', "don't understand", 'dont understand', 'say that again', 'lost me'],
  },
  {
    state: 'bored',
    phrases: ['whatever', 'can we skip', 'boring', 'too slow'],
  },
  {
    state: 'confident',
    phrases: ['i already know', 'got it', 'obviously', 'i know this', 'this is easy', 'too easy'],
  },
  {
    state: 'engaged',
    phrases: ['oh cool', 'what happens if', 'can i try', 'what if', 'interesting'],
  },
]

function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, '')
  return letters.length >= MIN_CAPS_LETTERS && letters === letters.toUpperCase()
}

export function affectObserver(userMessage: string, _history: ProviderMessage[]): AffectSignal {
  const text = userMessage.toLowerCase()
  for (const group of CUE_GROUPS) {
    const hit = group.phrases.find((phrase) => text.includes(phrase))
    if (hit !== undefined) {
      return { state: group.state, confidence: CUE_CONFIDENCE, cues: [hit] }
    }
  }
  if (isAllCaps(userMessage)) {
    return { state: 'frustrated', confidence: CUE_CONFIDENCE, cues: ['all caps'] }
  }
  return NEUTRAL_AFFECT
}
