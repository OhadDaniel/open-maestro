import { useRef } from 'react'
import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { useReveal } from '../../../../shared/motion/useReveal'
import { LESSON_DONE_COPY } from './lessondone.constants'
import { useCheckPop } from './useCheckPop'
import { useTypewriter } from './useTypewriter'

type LessonDoneCardProps = {
  onFinishWeek: () => void
  onBackToWeek: () => void
}

export function LessonDoneCard({ onFinishWeek, onBackToWeek }: LessonDoneCardProps) {
  const burstRef = useRef<HTMLDivElement | null>(null)
  const checkRef = useRef<HTMLDivElement | null>(null)
  const revealRef = useReveal<HTMLDivElement>()
  useCheckPop(burstRef, checkRef)
  const campLog = useTypewriter(LESSON_DONE_COPY.campLog)

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, zIndex: 5 }}>
      <div style={{ width: 440, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 30px 80px -20px rgba(0,0,0,.7)' }}>
        <div ref={burstRef} style={{ position: 'relative', width: 72, height: 72, marginBottom: 18 }}>
          <div ref={checkRef} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(206,245,133,.13)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Icon name="check" size={32} />
          </div>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em' }}>{LESSON_DONE_COPY.title}</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 6 }}>{LESSON_DONE_COPY.subtitle}</p>
        <div style={{ display: 'flex', gap: 18, marginTop: 20 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--fg-2)', fontSize: 13 }}><Icon name="clock" size={15} />{LESSON_DONE_COPY.minutes}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--fg-2)', fontSize: 13 }}><Icon name="play" size={15} />{LESSON_DONE_COPY.runs}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--sunset)', fontSize: 13, fontWeight: 600 }}><Icon name="flame-02" size={15} />{LESSON_DONE_COPY.streak}</span>
        </div>
        <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '22px 0 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={onFinishWeek} style={{ height: 48, padding: '0 24px', borderRadius: 'var(--r-pill)', border: 'none', background: 'var(--accent)', color: 'var(--ink)', fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            {LESSON_DONE_COPY.finishWeek}
            <Icon name="arrow-right" size={17} />
          </button>
          <button type="button" onClick={onBackToWeek} style={{ height: 48, padding: '0 20px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            {LESSON_DONE_COPY.backToWeek}
          </button>
        </div>
      </div>
      <div ref={revealRef} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <img src={ASSET.markOnDark} alt="" style={{ width: 22, height: 22 }} />
        <span data-reveal style={{ fontSize: 14, color: 'var(--fg-2)', minHeight: 20, display: 'inline-block' }}>{campLog}</span>
      </div>
    </div>
  )
}
