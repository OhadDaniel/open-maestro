import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { ASSET } from '../../../../shared/assets'
import { DURATION, EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import type { ChatMessage } from '../../../lesson/lesson.types'

export function AnimatedBubble({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const node = ref.current
    if (reduced || node === null) {
      return
    }
    animate(node, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: DURATION.fast,
      ease: EASE.outCubic,
    })
  }, [reduced])
  return <div ref={ref}>{children}</div>
}

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

function OfferWrapBubble({
  goalCount,
  onSend,
}: {
  goalCount: number
  onSend: (text: string) => void
}) {
  return (
    <TutorBubble>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span>{`You've reached all ${goalCount} goals of this lesson.`}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onSend('Wrap it up')}
            style={{ padding: '8px 16px', borderRadius: 20, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}
          >
            Wrap it up
          </button>
          <button
            onClick={() => onSend('one more practice')}
            style={{ padding: '8px 16px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--fg-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14 }}
          >
            One more practice
          </button>
        </div>
      </div>
    </TutorBubble>
  )
}

export function LiveMessage({
  message,
  onSend,
}: {
  message: ChatMessage
  onSend?: (text: string) => void
}) {
  if (message.role === 'tutor') {
    if (message.kind === 'offer-wrap') {
      return (
        <OfferWrapBubble
          goalCount={message.meta?.goalCount ?? 0}
          onSend={onSend ?? (() => {})}
        />
      )
    }
    return <TutorBubble>{message.text.length > 0 ? message.text : '…'}</TutorBubble>
  }
  return <UserBubble>{message.text}</UserBubble>
}
