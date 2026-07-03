import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
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
  beat: Lesson0Beat
  send: (text: string) => void
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'tutor', text: BEAT1_GREETING },
  ])
  const [generating, setGenerating] = useState(false)

  const persistProfile = useCallback((p: LearnerProfile) => {
    saveProfile(p)
    setProfile(p)
  }, [])

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (trimmed.length === 0 || generating || beat >= 3) {
        return
      }

      if (beat === 1) {
        const firstName = trimmed.split(/\s+/)[0] ?? trimmed
        persistProfile(withName(profile, trimmed))
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'student', text: trimmed },
          { id: nextId(), role: 'tutor', text: formatBeat2(firstName) },
        ])
        setBeat(2)
        return
      }

      persistProfile(withGoal(profile, trimmed))
      setMessages((prev) => [...prev, { id: nextId(), role: 'student', text: trimmed }])
      const replyId = nextId()
      setMessages((prev) => [...prev, { id: replyId, role: 'tutor', text: '' }])
      setBeat(3)
      setGenerating(true)
      void runBeat3(provider, trimmed, replyId, setMessages, setGenerating, setBeat)
    },
    [beat, generating, profile, provider, persistProfile],
  )

  return { messages, generating, beat, send }
}
