import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import type { ChatMessage } from '../../../lesson/lesson.types'
import { CODE_SCREEN_COPY } from './code.constants'

type CodeChatPaneProps = {
  title: string
  messages: ChatMessage[]
  isStreaming: boolean
  onBack: () => void
  onFinish: () => void
}

function MiniBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <img src={ASSET.markOnDark} alt="" style={{ width: 18, height: 18 }} />
      </div>
      <div style={{ padding: '10px 14px', borderRadius: '4px 18px 18px 18px', background: 'var(--surface-1)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{children}</div>
    </div>
  )
}

export function CodeChatPane({ title, messages, isStreaming, onBack, onFinish }: CodeChatPaneProps) {
  const tutorReplies = messages.filter((message) => message.role === 'tutor' && message.text.trim().length > 0)
  const canFinish = tutorReplies.length > 0 && !isStreaming

  return (
    <div style={{ flex: '0 0 500px', display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid var(--border)' }}>
      <div style={{ height: 62, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={onBack} style={{ width: 32, height: 32, borderRadius: 'var(--r-pill)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
            <Icon name="chevron-left" size={16} />
          </button>
          <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px 10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MiniBubble>{CODE_SCREEN_COPY.runIntro}</MiniBubble>
        {tutorReplies.map((message) => (
          <MiniBubble key={message.id}>{message.text}</MiniBubble>
        ))}
        {isStreaming && tutorReplies.length === 0 && <MiniBubble>{CODE_SCREEN_COPY.reading}</MiniBubble>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: canFinish ? 1 : 0, pointerEvents: canFinish ? 'auto' : 'none', transition: 'opacity .4s var(--e-out)' }}>
          <button type="button" onClick={onFinish} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px', fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: 'var(--ink)', border: 'none', borderRadius: '9999px 9999px 0 9999px', cursor: 'pointer' }}>
            {CODE_SCREEN_COPY.finishLesson}
            <Icon name="check" size={15} />
          </button>
        </div>
      </div>
      <div style={{ flex: 'none', padding: '12px 20px 16px' }}>
        <div style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', borderRadius: 14, padding: '5px 6px 6px' }}>
          <div style={{ padding: '9px 10px 4px', fontSize: 14, color: 'var(--fg-3)' }}>{CODE_SCREEN_COPY.composerPlaceholder}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px' }}>
            <div style={{ flex: 1 }} />
            <button type="button" style={{ width: 30, height: 30, borderRadius: 'var(--r-pill)', border: 'none', background: 'var(--fg)', color: '#0A0A0A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="send-03" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
