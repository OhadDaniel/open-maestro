import { Icon } from '../../../../shared/components/Icon'
import { useSegFill } from './useSegFill'

const SEG_COUNT = 5

type LessonHeaderProps = {
  onBack: () => void
  step: number
  title: string
  meta: string
}

export function LessonHeader({ onBack, step, title, meta }: LessonHeaderProps) {
  const fillRef = useSegFill<HTMLDivElement>()
  return (
    <div style={{ height: 70, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '0 30px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={onBack} style={{ width: 36, height: 36, borderRadius: 'var(--r-pill)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
          <Icon name="chevron-left" size={17} />
        </button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{meta}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', gap: 5, width: 280 }}>
          {Array.from({ length: SEG_COUNT }, (_, index) => {
            const filled = index < step - 1
            const partial = index === step - 1
            return (
              <div key={index} style={{ flex: 1, height: 6, borderRadius: 'var(--r-pill)', background: filled ? 'var(--accent)' : 'var(--surface-2)', overflow: 'hidden' }}>
                {partial && <div ref={fillRef} style={{ width: '0%', height: '100%', background: 'var(--accent)', borderRadius: 'var(--r-pill)' }} />}
              </div>
            )
          })}
        </div>
        <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>Step {step} of {SEG_COUNT}</span>
      </div>
    </div>
  )
}
