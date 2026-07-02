import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { WEEK_COPY } from './week.constants'

type WeekRailProps = {
  levelLabel: string
  levelPct: number
  lessonsToGo: number
  streakDays: number
}

export function WeekRail({ levelLabel, levelPct, lessonsToGo, streakDays }: WeekRailProps) {
  const dash = 138
  return (
    <div style={{ width: 308, flex: 'none', borderLeft: '1px solid var(--border)', padding: '34px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ position: 'relative', height: 150 }}>
          <img src={ASSET.walkRidge} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 62%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(20,20,19,.95),transparent 60%)' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 12 }}>
            <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-2)', fontWeight: 600 }}>{WEEK_COPY.railKicker}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{levelLabel}</div>
          </div>
        </div>
        <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 52, height: 52, flex: 'none' }}>
            <svg width={52} height={52} viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={26} cy={26} r={22} fill="none" style={{ stroke: 'var(--n300)', strokeWidth: 4 }} />
              <circle cx={26} cy={26} r={22} fill="none" strokeDasharray={dash} strokeDashoffset={dash * (1 - levelPct / 100)} style={{ stroke: 'var(--accent)', strokeWidth: 4, strokeLinecap: 'round' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{levelPct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{lessonsToGo} lessons to go</div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{WEEK_COPY.railGoal}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 12, background: 'rgba(255,139,98,.16)', color: 'var(--sunset)', flex: 'none' }}>
          <Icon name="flame-02" size={20} />
        </span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{streakDays} days</div>
          <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{WEEK_COPY.streakLabel}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 12, background: 'rgba(166,178,247,.16)', color: 'var(--lavender)', flex: 'none' }}>
          <Icon name="cpu-chip-01" size={20} />
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{WEEK_COPY.tutorTitle}</div>
          <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>{WEEK_COPY.tutorSub}</div>
        </div>
      </div>
    </div>
  )
}
