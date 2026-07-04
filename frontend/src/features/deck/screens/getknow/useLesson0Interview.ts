import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { TutorProvider } from '../../../../ai/provider'
import { stripThinkBlock } from '../../../../ai/strip-think'
import { withGoal, withName } from '../../../../memory/learner-profile'
import type { LearnerProfile } from '../../../../memory/learner-profile.types'
import { loadProfile, saveProfile } from '../../../../memory/profile-store'
import type { ChatMessage } from '../../../lesson/lesson.types'
import { BEAT1_GREETING, BEAT3_SYSTEM, buildBeat3Bubble, formatBeat2 } from './lesson0.constants'

let idCounter = 0

function nextId(): string {
  idCounter += 1
  return `l0-${idCounter}`
}

export type Lesson0Beat = 1 | 2 | 3 | 4

export type Lesson0Interview = {
  messages: ChatMessage[]
  generating: boolean
  scriptedTyping: boolean
  beat: Lesson0Beat
  send: (text: string) => void
  skipBeat: () => void
}

let skipCurrentBeat: (() => void) | null = null

const TW_CHARS = 3
const TW_DELAY_MS = 25

async function typewriterBeat(
  text: string,
  id: string,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  setScriptedTyping: Dispatch<SetStateAction<boolean>>,
): Promise<void> {
  let skipped = false
  skipCurrentBeat = () => {
    skipped = true
  }

  for (let pos = TW_CHARS; pos < text.length; pos += TW_CHARS) {
    if (skipped) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)))
      skipCurrentBeat = null
      return
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: text.slice(0, pos) } : m)),
    )
    await new Promise<void>((r) => setTimeout(r, TW_DELAY_MS))
  }

  setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)))
  skipCurrentBeat = null
  setScriptedTyping(false)
}

async function runBeat3(
  provider: TutorProvider | null,
  background: string,
  replyId: string,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  setGenerating: Dispatch<SetStateAction<boolean>>,
  setBeat: Dispatch<SetStateAction<Lesson0Beat>>,
): Promise<void> {
  let modelLine = ''
  try {
    if (provider !== null) {
      for await (const event of stripThinkBlock(
        provider.streamMessage({
          system: BEAT3_SYSTEM,
          messages: [{ role: 'user', content: background }],
        }),
      )) {
        if (event.type === 'text_delta') {
          modelLine += event.text
          setMessages((prev) =>
            prev.map((m) => (m.id === replyId ? { ...m, text: modelLine } : m)),
          )
        }
      }
    }
  } catch {
    // empty modelLine → buildBeat3Bubble applies fallback
  }
  const bubble = buildBeat3Bubble(modelLine)
  setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, text: bubble } : m)))
  setGenerating(false)
  setBeat(4)
}

export function useLesson0Interview(provider: TutorProvider | null): Lesson0Interview {
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile())
  const [beat, setBeat] = useState<Lesson0Beat>(1)
  const [beat1Id] = useState(() => nextId())
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: beat1Id, role: 'tutor', text: '' },
  ])
  const [generating, setGenerating] = useState(false)
  const [scriptedTyping, setScriptedTyping] = useState(true)

  useEffect(() => {
    void typewriterBeat(BEAT1_GREETING, beat1Id, setMessages, setScriptedTyping)
  }, [beat1Id])

  const persistProfile = useCallback((p: LearnerProfile) => {
    saveProfile(p)
    setProfile(p)
  }, [])

  const skipBeat = useCallback(() => {
    skipCurrentBeat?.()
  }, [])

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (trimmed.length === 0 || generating || beat >= 3) {
        return
      }

      if (beat === 1) {
        skipCurrentBeat?.()
        const firstName = trimmed.split(/\s+/)[0] ?? trimmed
        persistProfile(withName(profile, trimmed))
        const studentId = nextId()
        const beat2Id = nextId()
        setMessages((prev) => [
          ...prev,
          { id: studentId, role: 'student', text: trimmed },
          { id: beat2Id, role: 'tutor', text: '' },
        ])
        setBeat(2)
        void typewriterBeat(formatBeat2(firstName), beat2Id, setMessages, setScriptedTyping)
        return
      }

      skipCurrentBeat?.()
      persistProfile(withGoal(profile, trimmed))
      const studentId = nextId()
      const replyId = nextId()
      setMessages((prev) => [
        ...prev,
        { id: studentId, role: 'student', text: trimmed },
        { id: replyId, role: 'tutor', text: '' },
      ])
      setBeat(3)
      setGenerating(true)
      void runBeat3(provider, trimmed, replyId, setMessages, setGenerating, setBeat)
    },
    [beat, generating, profile, provider, persistProfile],
  )

  return { messages, generating, scriptedTyping, beat, send, skipBeat }
}
