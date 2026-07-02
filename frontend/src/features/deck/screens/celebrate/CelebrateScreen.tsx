import { useRef } from 'react'
import { ASSET } from '../../../../shared/assets'
import { PillButton } from '../../../../shared/components/PillButton'
import { useCelebration, useMedallionPop } from '../../../../shared/motion/useCelebration'
import { useReveal } from '../../../../shared/motion/useReveal'
import { TRACK_LABEL } from '../../../session/session.constants'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { CELEBRATE_COPY, celebrateSubhead, serialLine } from './celebrate.constants'

export function CelebrateScreen() {
  const { user, identity } = useSession()
  const { goTo } = useDeckNav()
  const screenRef = useRef<HTMLDivElement | null>(null)
  const medallionRef = useRef<HTMLDivElement | null>(null)
  const revealRef = useReveal<HTMLDivElement>()
  useCelebration(screenRef)
  useMedallionPop(medallionRef)

  return (
    <ScreenShell>
      <div ref={screenRef} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={ASSET.climbClouds} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', opacity: 0.55 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(85% 75% at 50% 46%,rgba(0,0,0,.15),rgba(0,0,0,.72) 66%,#000 100%)' }} />
        <div ref={revealRef} style={{ position: 'relative', zIndex: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, maxWidth: 580, padding: '0 40px' }}>
          <div ref={medallionRef} style={{ position: 'relative', width: 132, height: 132, marginBottom: 4 }}>
            <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', background: 'radial-gradient(circle,rgba(234,173,94,.42),rgba(206,245,133,.16) 50%,transparent 72%)', filter: 'blur(8px)', animation: 'om-breathe 4.2s var(--e-out) infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--gold)', opacity: 0.55 }} />
            <div style={{ position: 'absolute', inset: 13, borderRadius: '50%', border: '1.5px solid rgba(206,245,133,.5)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={ASSET.markOnDark} alt="" style={{ width: 62, height: 62 }} />
            </div>
          </div>
          <span data-reveal style={{ fontSize: 13, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--gold)' }}>
            {CELEBRATE_COPY.eyebrow}
          </span>
          <h1 data-reveal style={{ fontSize: 60, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-.02em' }}>
            {CELEBRATE_COPY.title}
          </h1>
          <p data-reveal style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--fg-2)', maxWidth: 460 }}>
            {celebrateSubhead(TRACK_LABEL[user.track])}
          </p>
          <div data-reveal style={{ marginTop: 8 }}>
            <PillButton label={CELEBRATE_COPY.cta} iconRight="arrow-right" height={56} onClick={() => goTo('getknow')} />
          </div>
          <p data-reveal style={{ fontSize: 12, color: 'var(--fg-3)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>
            {serialLine(identity.climberNo, identity.ascentStart)}
          </p>
        </div>
      </div>
    </ScreenShell>
  )
}
