import { useReveal } from '../../../../shared/motion/useReveal'
import { useCoursePosition } from '../../../course/useCoursePosition'
import { AppNav } from '../../../appnav/AppNav'
import { useLessonChatContext } from '../../../lessonchat/LessonChatContext'
import {
  FIRST_BUBBLE_FALLBACK,
  TUTOR_INTRO,
  TUTOR_TRY_PROMPT,
  memoryCallback,
} from '../../../lessonchat/lessonchat.constants'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { CodeCard } from './CodeCard'
import { Composer } from './Composer'
import { LessonHeader } from './LessonHeader'
import { LiveMessage, TutorBubble, TypingBubble, UserBubble } from './ChatBubbles'
import { SuggestionChips } from './SuggestionChips'
import { useLessonThread } from './useLessonThread'

export function LessonScreen() {
  const { goTo } = useDeckNav()
  const { provider } = useSession()
  const { baked, ready } = useLessonChatContext()
  const { currentWeekIndex, currentLessonIndex, currentLessonTitle } = useCoursePosition()
  const lessonMeta = `PY101 · Week ${currentWeekIndex + 1} · Lesson ${currentLessonIndex + 1}`

  return (
    <ScreenShell background="var(--surface)">
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <AppNav active="learn" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <LessonHeader step={2} title={currentLessonTitle} meta={lessonMeta} onBack={() => goTo('week')} />
          {ready && baked !== null ? (
            <LessonThread baked={baked} provider={provider} onOpenCode={() => goTo('code')} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 14 }}>Loading your lesson…</div>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}

type LessonThreadProps = {
  baked: NonNullable<ReturnType<typeof useLessonChatContext>['baked']>
  provider: ReturnType<typeof useSession>['provider']
  onOpenCode: () => void
}

function LessonThread({ baked, provider, onOpenCode }: LessonThreadProps) {
  const revealRef = useReveal<HTMLDivElement>()
  const { messages, isStreaming, typingDone, profileName, send } = useLessonThread(baked, provider)
  const firstBubble = profileName !== null ? memoryCallback(profileName) : FIRST_BUBBLE_FALLBACK

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 30px 12px' }}>
        <div ref={revealRef} style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TutorBubble>{firstBubble}</TutorBubble>
          <UserBubble>I&apos;m ready</UserBubble>
          <TutorBubble>{TUTOR_INTRO}</TutorBubble>
          <CodeCard />
          {typingDone ? (
            <>
              <TutorBubble>{TUTOR_TRY_PROMPT}</TutorBubble>
              <SuggestionChips onOpenCode={onOpenCode} onSuggest={send} />
            </>
          ) : (
            <TypingBubble />
          )}
          {messages.map((message) => (
            <LiveMessage key={message.id} message={message} />
          ))}
        </div>
      </div>
      <Composer disabled={isStreaming} onSend={send} />
    </>
  )
}
