import { Icon } from '../../../../shared/components/Icon'
import { useReveal } from '../../../../shared/motion/useReveal'
import { useViewedLesson } from '../../../lessonview/useViewedLesson'
import { AppNav } from '../../../appnav/AppNav'
import { useLessonChatContext } from '../../../lessonchat/LessonChatContext'
import { LESSON_CHAT_COPY } from '../../../lessonchat/lessonchat.constants'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { Composer } from './Composer'
import { LessonHeader } from './LessonHeader'
import { LiveMessage, TypingBubble } from './ChatBubbles'
import { useLessonThreadContext } from './LessonThreadContext'

export function LessonScreen() {
  const { goTo } = useDeckNav()
  const { baked, ready } = useLessonChatContext()
  const { weekIndex, lessonIndex, title } = useViewedLesson()
  const lessonMeta = `PY101 · Week ${weekIndex + 1} · Lesson ${lessonIndex + 1}`

  return (
    <ScreenShell background="var(--surface)">
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <AppNav active="learn" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <LessonHeader step={2} title={title} meta={lessonMeta} onBack={() => goTo('week')} />
          {ready && baked !== null ? (
            <LessonThread onOpenCode={() => goTo('code')} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 14 }}>Loading your lesson…</div>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}

function LessonThread({ onOpenCode }: { onOpenCode: () => void }) {
  const revealRef = useReveal<HTMLDivElement>()
  const { messages, isStreaming, send } = useLessonThreadContext()

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 30px 12px' }}>
        <div ref={revealRef} style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.length === 0 ? (
            <TypingBubble />
          ) : (
            messages.map((message) => <LiveMessage key={message.id} message={message} onSend={send} />)
          )}
          <div style={{ display: 'flex' }}>
            <button
              type="button"
              onClick={onOpenCode}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              <Icon name="file-code-01" size={16} />
              {LESSON_CHAT_COPY.openCodePanel}
            </button>
          </div>
        </div>
      </div>
      <Composer disabled={isStreaming} onSend={send} />
    </>
  )
}
