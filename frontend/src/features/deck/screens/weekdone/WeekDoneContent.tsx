import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { WD_STAT_PILLS, memoryLine, weekClearedCopy } from './weekdone.constants'

type WeekDoneContentProps = {
  weekNumber: number
  weekTitle: string
  why: string
  onOnward: () => void
  onBackToSummit: () => void
}

const GLASS_PILL: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  height: 34,
  padding: '0 14px',
  borderRadius: 'var(--r-pill)',
  backdropFilter: 'blur(10px)',
  fontSize: 13,
}

export function WeekDoneContent({ weekNumber, weekTitle, why, onOnward, onBackToSummit }: WeekDoneContentProps) {
  const copy = weekClearedCopy(weekNumber, weekTitle)
  return (
    <div style={{ position: 'absolute', left: 64, bottom: 54, width: 600, display: 'flex', flexDirection: 'column', gap: 18, zIndex: 16 }}>
      <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: 'var(--gold)' }}>
        <Icon name="check-circle" size={19} />
        <span style={{ fontSize: 13, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 }}>{copy.tag}</span>
      </div>
      <h1 data-reveal style={{ fontSize: 58, lineHeight: 1.03, fontWeight: 700, letterSpacing: '-.02em' }}>{copy.headline}<br />{copy.headline2}</h1>
      <p data-reveal style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--fg-2)', maxWidth: 470 }}>{copy.sub}</p>
      <div data-reveal style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ ...GLASS_PILL, background: 'rgba(18,18,17,.72)', border: '1px solid var(--border)', color: 'var(--fg-2)', fontWeight: 500 }}><Icon name="book-opened-02" size={15} />{WD_STAT_PILLS.lessons}</span>
        <span style={{ ...GLASS_PILL, background: 'rgba(18,18,17,.72)', border: '1px solid var(--border)', color: 'var(--fg-2)', fontWeight: 500 }}><Icon name="clock" size={15} />{WD_STAT_PILLS.time}</span>
        <span style={{ ...GLASS_PILL, background: 'rgba(255,139,98,.14)', color: 'var(--sunset)', fontWeight: 600 }}><Icon name="flame-02" size={15} />{WD_STAT_PILLS.streak}</span>
      </div>
      <div data-reveal style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
        <img src={ASSET.markOnDark} alt="" style={{ width: 22, height: 22, flex: 'none' }} />
        <span style={{ fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{memoryLine(why, weekNumber + 1)}</span>
      </div>
      <div data-reveal style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
        <button type="button" onClick={onOnward} style={{ height: 56, padding: '0 30px', borderRadius: 'var(--r-pill)', border: 'none', background: 'var(--accent)', color: 'var(--ink)', fontSize: 17, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 12px 44px -8px rgba(206,245,133,.5)' }}>
          {copy.onward}
          <Icon name="arrow-right" size={19} />
        </button>
        <button type="button" onClick={onBackToSummit} style={{ height: 56, padding: '0 24px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg)', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>
          {WD_STAT_PILLS.backToSummit}
        </button>
      </div>
    </div>
  )
}
