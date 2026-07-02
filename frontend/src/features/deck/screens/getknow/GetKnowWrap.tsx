import { Icon } from '../../../../shared/components/Icon'
import { MaestroMark } from '../../../../shared/components/MaestroMark'
import { PillButton } from '../../../../shared/components/PillButton'
import { GETKNOW_COPY, GETKNOW_FEATURES, wrapTitle } from './getknow.constants'

type GetKnowWrapProps = {
  name: string
  onFinish: () => void
}

export function GetKnowWrap({ name, onFinish }: GetKnowWrapProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 90px 20px' }}>
      <MaestroMark size={56} glow="evergreen" />
      <h1 data-gk-item style={{ fontSize: 38, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-.015em', textAlign: 'center' }}>
        {wrapTitle(name)}
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 640, marginTop: 4 }}>
        {GETKNOW_FEATURES.map((feature) => (
          <div key={feature.title} data-gk-item style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', background: 'rgba(26,26,25,.72)' }}>
            <span style={{ width: 46, height: 46, flex: 'none', borderRadius: 12, background: feature.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color }}>
              <Icon name={feature.icon} size={22} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)' }}>{feature.title}</span>
              <span style={{ fontSize: 13.5, color: 'var(--fg-2)' }}>{feature.sub}</span>
            </span>
          </div>
        ))}
      </div>
      <div data-gk-item style={{ marginTop: 8 }}>
        <PillButton label={GETKNOW_COPY.cta} iconRight="arrow-right" height={56} onClick={onFinish} />
      </div>
      <p data-gk-item style={{ fontSize: 13, color: 'var(--fg-3)' }}>{GETKNOW_COPY.footnote}</p>
    </div>
  )
}
