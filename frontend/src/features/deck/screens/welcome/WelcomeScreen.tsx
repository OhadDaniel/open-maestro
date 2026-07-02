import { ASSET } from '../../../../shared/assets'
import { MaestroMark } from '../../../../shared/components/MaestroMark'
import { PillButton } from '../../../../shared/components/PillButton'
import { useParallax } from '../../../../shared/motion/useParallax'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { useWelcomeMotion } from './useWelcomeMotion'
import { SHIMMER_GRADIENT, WELCOME_COPY } from './welcome.constants'

const KICKER_RULE: React.CSSProperties = { width: 34, height: 1, background: 'var(--border-strong)' }

export function WelcomeScreen() {
  const parallaxRef = useParallax<HTMLDivElement>()
  const motionRef = useWelcomeMotion<HTMLDivElement>()
  const { goTo } = useDeckNav()

  return (
    <ScreenShell>
      <div ref={parallaxRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img
          data-plx-img
          src={ASSET.climbSummit}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 40%',
            transform: 'scale(1.06)',
            willChange: 'transform',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(120% 78% at 72% 30%, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 62%, #000 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top,#000 4%,rgba(0,0,0,.15) 40%,rgba(0,0,0,.35) 100%)',
          }}
        />

        <div
          ref={motionRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 40px',
            gap: 26,
          }}
        >
          <MaestroMark size={96} glow="mixed" ring parallax style={{ marginBottom: 2 }} />
          <div data-reveal style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={KICKER_RULE} />
            <span
              style={{
                fontSize: 12,
                letterSpacing: '.26em',
                color: 'var(--fg-2)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {WELCOME_COPY.kicker}
            </span>
            <span style={KICKER_RULE} />
          </div>
          <h1
            style={{
              fontSize: 76,
              lineHeight: 1.04,
              fontWeight: 700,
              letterSpacing: '-.022em',
              maxWidth: 920,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: 0,
            }}
          >
            <span style={{ display: 'block', overflow: 'hidden', padding: '0 8px 6px' }}>
              <span data-wline style={{ display: 'block' }}>
                {WELCOME_COPY.lineOne}
              </span>
            </span>
            <span
              style={{ display: 'block', overflow: 'hidden', padding: '0 8px 10px', marginTop: -4 }}
            >
              <span
                data-wline
                style={{
                  display: 'block',
                  background: SHIMMER_GRADIENT,
                  backgroundSize: '230% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'om-shimmer 3s ease 1.1s 1 both',
                }}
              >
                {WELCOME_COPY.lineTwo}
              </span>
            </span>
          </h1>
          <p
            data-reveal
            style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--fg-2)', maxWidth: 520 }}
          >
            {WELCOME_COPY.sub}
          </p>
          <div data-reveal style={{ marginTop: 8 }}>
            <PillButton
              label={WELCOME_COPY.cta}
              iconRight="arrow-right"
              magnetic
              height={58}
              onClick={() => goTo('name')}
            />
          </div>
        </div>

        <div data-motes style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 26, left: 40, zIndex: 10 }}>
          <img src={ASSET.logoOnDark} alt="" style={{ height: 20, display: 'block', opacity: 0.92 }} />
        </div>
        <div style={cornerStyle('left')}>{WELCOME_COPY.cornerLeft}</div>
        <div style={cornerStyle('right')}>{WELCOME_COPY.cornerRight}</div>
      </div>
    </ScreenShell>
  )
}

function cornerStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    bottom: 24,
    [side]: 40,
    zIndex: 10,
    fontSize: 11,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    color: 'var(--fg-3)',
  }
}
