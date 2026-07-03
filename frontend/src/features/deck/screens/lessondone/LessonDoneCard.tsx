import { useRef } from 'react'
import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { useReveal } from '../../../../shared/motion/useReveal'
import { LESSON_DONE_COPY, finishWeekLabel } from './lessondone.constants'
import { useCheckPop } from './useCheckPop'

export type LessonDoneMode = 'advance' | 'finish-week' | 'review'

type LessonDoneCardProps = {
  title: string
  subtitle: string
  summaryBullets: string[]
  mode: LessonDoneMode
  weekNumber: number
  onContinue: () => void
  onFinishWeek: () => void
  onBackToWeek: () => void
}

export function LessonDoneCard({
  title,
  subtitle,
  summaryBullets,
  mode,
  weekNumber,
  onContinue,
  onFinishWeek,
  onBackToWeek,
}: LessonDoneCardProps) {
  const burstRef = useRef<HTMLDivElement | null>(null)
  const checkRef = useRef<HTMLDivElement | null>(null)
  const revealRef = useReveal<HTMLDivElement>()
  const bulletsRef = useReveal<HTMLUListElement>()
  useCheckPop(burstRef, checkRef)

  const primaryLabel =
    mode === 'finish-week'
      ? finishWeekLabel(weekNumber)
      : mode === 'review'
        ? LESSON_DONE_COPY.backToWeek
        : LESSON_DONE_COPY.continue
  const onPrimary = mode === 'finish-week' ? onFinishWeek : mode === 'review' ? onBackToWeek : onContinue
  const showSecondary = mode !== 'review'

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, zIndex: 5 }}>
      <div style={{ width: 440, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 30px 80px -20px rgba(0,0,0,.7)' }}>
        <div ref={burstRef} style={{ position: 'relative', width: 72, height: 72, marginBottom: 18 }}>
          <div ref={checkRef} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(206,245,133,.13)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Icon name="check" size={32} />
          </div>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em' }}>{LESSON_DONE_COPY.title}</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', marginTop: 6 }}>{subtitle}</p>
        {summaryBullets.length > 0 && (
          <ul ref={bulletsRef} style={{ width: '100%', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, textAlign: 'left' }}>
            {summaryBullets.map((bullet) => (
              <li key={bullet} data-reveal style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.45 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                {bullet}
              </li>
            ))}
          </ul>
        )}
        <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '22px 0 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={onPrimary} style={{ height: 48, padding: '0 24px', borderRadius: 'var(--r-pill)', border: 'none', background: 'var(--accent)', color: 'var(--ink)', fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            {primaryLabel}
            <Icon name="arrow-right" size={17} />
          </button>
          {showSecondary && (
            <button type="button" onClick={onBackToWeek} style={{ height: 48, padding: '0 20px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              {LESSON_DONE_COPY.backToWeek}
            </button>
          )}
        </div>
      </div>
      <div ref={revealRef} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <img src={ASSET.markOnDark} alt="" style={{ width: 22, height: 22 }} />
        <span data-reveal style={{ fontSize: 14, color: 'var(--fg-2)', minHeight: 20, display: 'inline-block' }}>{title}</span>
      </div>
    </div>
  )
}
