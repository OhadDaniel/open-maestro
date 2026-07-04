import { useCallback, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { TutorProvider } from '../../../ai/provider'
import type { ProviderMessage } from '../../../ai/provider.types'
import type { BakedLesson } from '../../../content/baked.types'
import type { TutorSession } from '../../../content/session.types'
import { defaultHarnessDeps, handleTurn, openLesson } from '../../../harness/orchestrator'
import type { LearnerProfile } from '../../../memory/learner-profile.types'
import { masteryTracer } from '../../../harness/sense/masteryTracer'
import type { ChatMessage } from '../lesson.types'

const HISTORY_LIMIT = 12

let messageCounter = 0

function nextId(): string {
  messageCounter += 1
  return `m${messageCounter}`
}

function toProviderMessages(messages: ChatMessage[]): ProviderMessage[] {
  return messages
    .filter((message) => message.text.trim().length > 0)
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
      role: message.role === 'tutor' ? 'assistant' : 'user',
      content: message.text,
    }))
}

type RunResult = { ok: boolean; output: string }

type UseTutorChat = {
  messages: ChatMessage[]
  isStreaming: boolean
  session: TutorSession
  seedTutorMessage: (text: string) => void
  beginLesson: () => Promise<void>
  sendMessage: (text: string, runResult?: RunResult) => Promise<void>
  skipTyping: () => void
}

export function useTutorChat(
  provider: TutorProvider,
  baked: BakedLesson,
  initialSession: TutorSession,
  profile: LearnerProfile,
  onProfileLearned: (profile: LearnerProfile) => void,
  onReplyComplete: (replyId: string) => void,
): UseTutorChat {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [session, setSession] = useState<TutorSession>(initialSession)
  const sessionRef = useRef<TutorSession>(initialSession)
  const deps = useMemo(() => defaultHarnessDeps(provider), [provider])
  const skipRef = useRef(false)
  const skipTyping = useCallback(() => { skipRef.current = true }, [])

  const onSessionUpdated = useCallback((updated: TutorSession) => {
    sessionRef.current = updated
    setSession(updated)
  }, [])

  // stuck-outcome tracking refs
  const lastPracticingIdxRef = useRef(-1)
  const stuckCountRef = useRef(0)

  const seedTutorMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'tutor', text }])
  }, [])

  const beginLesson = useCallback(async () => {
    if (isStreaming) {
      return
    }
    skipRef.current = false
    const replyId = nextId()
    setMessages((prev) => [...prev, { id: replyId, role: 'tutor', text: '' }])
    setIsStreaming(true)
    await openLesson(
      {
        baked,
        session,
        profile,
        skipRef,
        onToken: (token) =>
          setMessages((prev) =>
            prev.map((message) =>
              message.id === replyId ? { ...message, text: message.text + token } : message,
            ),
          ),
        onReveal: (text) =>
          flushSync(() =>
            setMessages((prev) =>
              prev.map((message) =>
                message.id === replyId ? { ...message, text } : message,
              ),
            ),
          ),
      },
      deps,
    )
    setIsStreaming(false)
  }, [deps, baked, session, profile, isStreaming])

  const sendMessage = useCallback(
    async (text: string, runResult?: RunResult) => {
      const trimmed = text.trim()
      if (trimmed.length === 0 || isStreaming) {
        return
      }

      // stuck-outcome tracking before the turn
      const mastery = masteryTracer(sessionRef.current, baked)
      const practicingIdx = mastery.skills.findIndex((s) => s.status === 'practicing')
      if (practicingIdx >= 0 && practicingIdx === lastPracticingIdxRef.current) {
        stuckCountRef.current += 1
      } else {
        stuckCountRef.current = 1
        lastPracticingIdxRef.current = practicingIdx
      }

      const studentMessage: ChatMessage = {
        id: nextId(),
        role: 'student',
        text: trimmed,
      }
      const replyId = nextId()
      const history = toProviderMessages([...messages, studentMessage])
      setMessages((prev) => [
        ...prev,
        studentMessage,
        { id: replyId, role: 'tutor', text: '' },
      ])
      setIsStreaming(true)
      const { action, masteryAdvanced } = await handleTurn(
        {
          userMessage: trimmed,
          baked,
          session: sessionRef.current,
          profile,
          messages: history,
          onToken: (token) =>
            setMessages((prev) =>
              prev.map((message) =>
                message.id === replyId
                  ? { ...message, text: message.text + token }
                  : message,
              ),
            ),
          onProfileLearned,
          onSessionUpdated,
          runResult,
          stuckCount: stuckCountRef.current,
        },
        deps,
      )

      if (masteryAdvanced) {
        stuckCountRef.current = 0
        lastPracticingIdxRef.current = -1
      }

      if (action === 'offer-wrap') {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === replyId
              ? {
                  ...message,
                  kind: 'offer-wrap' as const,
                  meta: { goalCount: baked.lesson.masteryOutcomes.length },
                }
              : message,
          ),
        )
      }
      setIsStreaming(false)
      onReplyComplete(replyId)
    },
    [deps, baked, session, profile, messages, isStreaming, onProfileLearned, onReplyComplete, onSessionUpdated],
  )

  return { messages, isStreaming, session, seedTutorMessage, beginLesson, sendMessage, skipTyping }
}
