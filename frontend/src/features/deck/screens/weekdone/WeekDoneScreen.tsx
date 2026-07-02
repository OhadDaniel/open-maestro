import { useRef } from 'react'
import { Icon } from '../../../../shared/components/Icon'
import { ASSET } from '../../../../shared/assets'
import { useCelebration } from '../../../../shared/motion/useCelebration'
import { useReveal } from '../../../../shared/motion/useReveal'
import { useCoursePosition } from '../../../course/useCoursePosition'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { WeekDoneContent } from './WeekDoneContent'
import { useClearWeek } from './useClearWeek'
import { useWeekDoneMotion } from './useWeekDoneMotion'
import { WD_CAMP, WD_DOTS, WD_PATH, weekClearedCopy } from './weekdone.constants'

export function WeekDoneScreen() {
  const { goTo } = useDeckNav()
  const { user } = useSession()
  const { currentWeekIndex, weeks } = useCoursePosition()
  const clearedIndexRef = useRef(currentWeekIndex)
  const clearedIndex = clearedIndexRef.current
  const stageRef = useWeekDoneMotion<HTMLDivElement>()
  const revealRef = useReveal<HTMLDivElement>()
  useCelebration(stageRef)
  useClearWeek(clearedIndex)

  const weekNumber = clearedIndex + 1
  const weekTitle = weeks[clearedIndex]?.title ?? ''
  const camp = weekClearedCopy(weekNumber, weekTitle)

  return (
    <ScreenShell>
      <div ref={stageRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#000' }}>
        <img src={ASSET.climbDarkpitch} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '35% 45%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg,#000 14%,rgba(0,0,0,.66) 42%,rgba(0,0,0,.12) 74%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.78) 6%,transparent 44%)' }} />
        <div data-ws-sky style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }} />
        <svg viewBox="0 0 1240 760" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 4, overflow: 'visible' }}>
          <path data-wd-path d={WD_PATH} fill="none" style={{ stroke: 'var(--accent)', strokeWidth: 3.5, strokeLinecap: 'round' }} />
        </svg>
        {WD_DOTS.map(([x, y]) => (
          <span key={`${x}-${y}`} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', zIndex: 5 }}>
            <span data-wd-core style={{ display: 'block', width: 13, height: 13, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 12px rgba(206,245,133,.8)' }} />
          </span>
        ))}
        <div style={{ position: 'absolute', left: WD_CAMP[0], top: WD_CAMP[1], transform: 'translate(-50%,-50%)', zIndex: 6 }}>
          <div data-wd-campwrap style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 46, height: 46 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--gold)', animation: 'om-ping 2.6s var(--e-out) infinite' }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--gold)', animation: 'om-ping 2.6s var(--e-out) 1.3s infinite' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(234,173,94,.16)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
                <Icon name="diamond-01" size={19} />
              </div>
            </div>
            <div style={{ textAlign: 'center', textShadow: '0 1px 6px #000' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{camp.campWeek}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-2)' }}>unlocked</div>
            </div>
          </div>
        </div>
        <div ref={revealRef} style={{ position: 'absolute', inset: 0 }}>
          <WeekDoneContent weekNumber={weekNumber} weekTitle={weekTitle} why={user.why} onOnward={() => goTo('week')} onBackToSummit={() => goTo('home')} />
        </div>
      </div>
    </ScreenShell>
  )
}
