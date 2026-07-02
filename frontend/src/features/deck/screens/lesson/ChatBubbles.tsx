import { ASSET } from '../../../../shared/assets'
import type { ChatMessage } from '../../../lesson/lesson.types'

export function TutorBubble({ children }: { children: React.ReactNode }) {
  return (
    <div data-reveal style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <img src={ASSET.markOnDark} alt="" style={{ width: 19, height: 19 }} />
      </div>
      <div style={{ padding: '11px 15px', borderRadius: '4px 20px 20px 20px', background: 'var(--surface-1)', fontSize: 15, lineHeight: 1.5, maxWidth: 460 }}>{children}</div>
    </div>
  )
}

export function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div data-reveal style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ padding: '11px 15px', borderRadius: '20px 4px 20px 20px', background: '#1A3426', fontSize: 15, lineHeight: 1.5, maxWidth: 420 }}>{children}</div>
    </div>
  )
}

export function TypingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <img src={ASSET.markOnDark} alt="" style={{ width: 19, height: 19 }} />
      </div>
      <div style={{ padding: '15px 16px', borderRadius: '4px 20px 20px 20px', background: 'var(--surface-1)', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 0.15, 0.3].map((delay) => (
          <span key={delay} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--fg-3)', animation: `om-dot 1.2s ${delay}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

export function LiveMessage({ message }: { message: ChatMessage }) {
  if (message.role === 'tutor') {
    return <TutorBubble>{message.text.length > 0 ? message.text : '…'}</TutorBubble>
  }
  return <UserBubble>{message.text}</UserBubble>
}
