import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { StreakPill } from '../../../../shared/components/StreakPill'
import { AppNav } from '../../../appnav/AppNav'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { LevelMarker } from './LevelMarker'
import {
  HOME_COPY,
  HOME_LEVELS,
  TRAIL_DONE_PATH,
  TRAIL_GHOST_PATH,
  homeGreeting,
  levelState,
} from './home.constants'
import { useHomeCurrent } from './useHomeCurrent'
import { useHomeMotion } from './useHomeMotion'

export function HomeScreen() {
  const { user, streak } = useSession()
  const { goTo } = useDeckNav()
  const { currentWeekIndex, levelPct, resumeTitle, resumeMeta, completedConstellations } =
    useHomeCurrent()
  const stageRef = useHomeMotion<HTMLDivElement>(completedConstellations)

  return (
    <ScreenShell>
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <AppNav active="home" />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
          <img src={ASSET.climbRidge} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '52% 46%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(108deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.45) 34%,rgba(0,0,0,.12) 72%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.75),transparent 40%)' }} />

          <div style={{ position: 'absolute', left: 44, top: 34, zIndex: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-.01em' }}>{homeGreeting(user.name)}</h2>
              <StreakPill days={streak.days} />
            </div>
            <p style={{ fontSize: 16, color: 'var(--fg-2)', marginTop: 6, textShadow: '0 1px 6px rgba(0,0,0,.6)' }}>
              Level {currentWeekIndex + 1} of {HOME_LEVELS.length} · you're {levelPct}% of the way to the next camp
            </p>
          </div>

          <div ref={stageRef} style={{ position: 'absolute', inset: 0 }}>
            <div data-sky style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 66, right: 22, zIndex: 8, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--fg-3)', fontSize: 12, textShadow: '0 1px 4px #000' }}>
              <Icon name="magic-wand-01" size={13} />
              {HOME_COPY.skyCaption}
            </div>
            <div style={{ position: 'absolute', inset: 0, zIndex: 4 }}>
              <svg viewBox="0 0 1000 760" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                <path d={TRAIL_GHOST_PATH} fill="none" stroke="rgba(236,235,228,.32)" strokeWidth={2.5} strokeDasharray="2 9" strokeLinecap="round" />
                <path data-trail-done d={TRAIL_DONE_PATH} fill="none" style={{ stroke: 'var(--accent)', strokeWidth: 3.5, strokeLinecap: 'round', filter: 'drop-shadow(0 0 7px rgba(206,245,133,.6))' }} />
              </svg>
              {HOME_LEVELS.map((node, index) => (
                <LevelMarker key={node.level} node={node} state={levelState(index, currentWeekIndex)} />
              ))}
            </div>
          </div>

          <div style={{ position: 'absolute', right: 40, bottom: 34, zIndex: 8, display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: 'rgba(16,16,15,.86)', backdropFilter: 'blur(14px)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: '0 18px 50px -14px rgba(0,0,0,.7)' }}>
            <div style={{ position: 'relative', width: 48, height: 48, flex: 'none' }}>
              <svg width={48} height={48} viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={24} cy={24} r={20} fill="none" style={{ stroke: 'var(--n300)', strokeWidth: 4 }} />
                <circle cx={24} cy={24} r={20} fill="none" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - levelPct / 100)} style={{ stroke: 'var(--accent)', strokeWidth: 4, strokeLinecap: 'round' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{levelPct}%</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{HOME_COPY.resumeKicker}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 3 }}>{resumeTitle}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 1 }}>{resumeMeta}</div>
            </div>
            <button type="button" onClick={() => goTo('week')} style={{ marginLeft: 8, height: 52, padding: '0 24px', borderRadius: 'var(--r-pill)', border: 'none', background: 'var(--accent)', color: 'var(--ink)', fontSize: 16, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
              {HOME_COPY.continue}
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
