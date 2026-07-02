import { useEffect, useRef, useState } from 'react'
import type { TutorProvider } from '../../../ai/provider'
import type { BakedLesson } from '../../../content/baked.types'
import { loadProfile, saveProfile } from '../../../memory/profile-store'
import type { LearnerProfile } from '../../../memory/learner-profile.types'
import { createSession, passCheck } from '../../../tutor/session'
import type { LessonEvents } from '../events'
import { greetingFor } from '../lesson.constants'
import { useTutorChat } from '../hooks/useTutorChat'
import { LessonView } from './LessonView'

type LessonSessionProps = {
  baked: BakedLesson
  provider: TutorProvider
  events: LessonEvents
  lessonNumber: number
  lessonCount: number
  onNext: () => void
}

export function LessonSession({
  baked,
  provider,
  events,
  lessonNumber,
  lessonCount,
  onNext,
}: LessonSessionProps) {
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile())
  const [session, setSession] = useState(() => createSession(baked.lesson.id))
  const [celebrationText, setCelebrationText] = useState('')
  const seededRef = useRef(false)

  useEffect(() => {
    setSession(createSession(baked.lesson.id))
  }, [baked.lesson.id])

  const onProfileLearned = (learned: LearnerProfile) => {
    saveProfile(learned)
    setProfile(learned)
  }

  const { messages, isStreaming, seedTutorMessage, sendMessage } = useTutorChat(
    provider,
    baked,
    session,
    profile,
    onProfileLearned,
    (replyId) => events.onStepComplete(replyId),
  )

  useEffect(() => {
    if (seededRef.current) {
      return
    }
    seededRef.current = true
    seedTutorMessage(greetingFor(profile.name, baked.lesson.title))
  }, [seedTutorMessage, profile.name, baked.lesson.title])

  const check = baked.checks[0]
  const isLast = lessonNumber >= lessonCount

  const onCodeSubmit = (code: string, output: string) => {
    events.onStepComplete('code-submit')
    const shownOutput = output.length > 0 ? output : '(I have not run it yet)'
    void sendMessage(`I ran this code:\n\n${code}\n\nOutput:\n${shownOutput}`)
  }

  const onUnderstood = () => {
    events.onCheckPassed(check.id)
    setSession((current) => passCheck(current, check.id))
    setCelebrationText('Nice — that concept is locked in.')
  }

  const onNextLesson = () => {
    events.onLessonComplete(baked.lesson.id)
    events.onStreakExtended(1)
    onNext()
  }

  return (
    <LessonView
      baked={baked}
      lessonNumber={lessonNumber}
      lessonCount={lessonCount}
      isLast={isLast}
      messages={messages}
      isStreaming={isStreaming}
      checkPrompt={check.prompt}
      celebrationText={celebrationText}
      onSend={sendMessage}
      onCodeSubmit={onCodeSubmit}
      onUnderstood={onUnderstood}
      onNextLesson={onNextLesson}
    />
  )
}
