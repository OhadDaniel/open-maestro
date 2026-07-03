import { useEffect, useRef } from 'react'
import { ASSET } from '../../../../shared/assets'
import { PillButton } from '../../../../shared/components/PillButton'
import { useParallax } from '../../../../shared/motion/useParallax'
import { useProgressContext } from '../../../progress/ProgressContext'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { TutorBubble, UserBubble } from '../lesson/ChatBubbles'
import { Composer } from '../lesson/Composer'
import { LESSON0_CTA, LESSON0_HEADER, LESSON0_SUB } from './lesson0.constants'
import { useLesson0Interview } from './useLesson0Interview'

const BEAT_LABEL: Record<number, string> = {
  1: 'Question 1 of 2',
  2: 'Question 2 of 2',
  3: 'One moment…',
  4: 'Lesson 0 complete',
}

export function GetKnowScreen() {
  const parallaxRef = useParallax<HTMLDivElement>()
  const { provider } = useSession()
  const { markFirstRunDone } = useProgressContext()
  const { goTo } = useDeckNav()
  const { messages, generating, beat, send } = useLesson0Interview(provider)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const onFinish = () => {
    markFirstRunDone()
    goTo('home')
  }

  return (
    <ScreenShell>
      <div ref={parallaxRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img
          data-plx-img
          src={ASSET.climbBasecamp}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '64% 78%', opacity: 0.14, transform: 'scale(1.06)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 55% at 50% 28%,rgba(166,178,247,.09),transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#000 6%,rgba(0,0,0,.4) 40%,rgba(0,0,0,.7) 100%)' }} />

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <img src={ASSET.markOnDark} alt="" style={{ width: 36, height: 36, display: 'block' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{LESSON0_HEADER}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{LESSON0_SUB}</div>
            </div>
          </div>
          <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600 }}>
            {BEAT_LABEL[beat] ?? ''}
          </span>
        </div>

        <div
          style={{ position: 'absolute', top: 88, bottom: 88, left: 0, right: 0, overflowY: 'auto', padding: '24px 40px', zIndex: 5 }}
        >
          <div style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
            {messages.map((message) =>
              message.role === 'tutor' ? (
                <TutorBubble key={message.id}>
                  {message.text.length > 0 ? message.text : '…'}
                </TutorBubble>
              ) : (
                <UserBubble key={message.id}>{message.text}</UserBubble>
              ),
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
          {beat === 4 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 40px 24px' }}>
              <PillButton label={LESSON0_CTA} iconRight="arrow-right" height={54} onClick={onFinish} />
            </div>
          ) : (
            <Composer disabled={generating || beat >= 3} onSend={send} />
          )}
        </div>

        <img
          src={ASSET.walkPeak}
          alt=""
          style={{ position: 'absolute', right: 30, bottom: 14, width: 300, height: 300, objectFit: 'cover', opacity: 0.3, zIndex: 1, pointerEvents: 'none', WebkitMaskImage: 'radial-gradient(closest-side,#000 55%,transparent 82%)', maskImage: 'radial-gradient(closest-side,#000 55%,transparent 82%)' }}
        />
      </div>
    </ScreenShell>
  )
}
