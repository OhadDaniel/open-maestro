import { useRef } from 'react'
import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { PillButton } from '../../../../shared/components/PillButton'
import { useParallax } from '../../../../shared/motion/useParallax'
import { TRACK_LABEL } from '../../../session/session.constants'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { StepDots } from '../../components/StepDots'
import { CHECKLIST, DOWNLOAD_COPY, RING_CIRCUMFERENCE, statusFor } from './download.constants'
import { useDownloadBurst } from './useDownloadBurst'
import { useDownloadProgress } from './useDownloadProgress'

const RING_RADIUS = 112

export function DownloadScreen() {
  const { provider, setProvider, user } = useSession()
  const { goTo } = useDeckNav()
  const { percent, done } = useDownloadProgress(provider, setProvider)
  const parallaxRef = useParallax<HTMLDivElement>()

  const screenRef = useRef<HTMLDivElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const markRef = useRef<HTMLImageElement | null>(null)
  const ringRef = useRef<SVGCircleElement | null>(null)
  const pulseRef = useRef<HTMLDivElement | null>(null)

  useDownloadBurst(done, {
    screen: screenRef,
    glow: glowRef,
    mark: markRef,
    ring: ringRef,
    pulseHost: pulseRef,
  })

  const rounded = Math.round(percent)
  const offset = RING_CIRCUMFERENCE * (1 - percent / 100)
  const glowOpacity = 0.34 + 0.62 * (percent / 100)
  const glowScale = 0.9 + 0.28 * (percent / 100)
  const trackLabel = TRACK_LABEL[user.track]

  return (
    <ScreenShell background="radial-gradient(90% 70% at 50% 42%,#111 0%,#000 70%)">
      <div ref={parallaxRef} style={{ position: 'absolute', inset: 0 }}>
        <div ref={screenRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 48, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <StepDots step={3} total={3} />
            <span style={{ fontSize: 12, letterSpacing: '.18em', color: 'var(--fg-3)', textTransform: 'uppercase', fontWeight: 600 }}>
              {DOWNLOAD_COPY.kicker}
            </span>
          </div>

          <div data-plx-orb style={{ position: 'relative', width: 264, height: 264 }}>
            <div
              ref={glowRef}
              style={{
                position: 'absolute',
                inset: -46,
                borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(166,178,247,.5),rgba(206,245,133,.18) 46%,transparent 70%)',
                filter: 'blur(12px)',
                opacity: glowOpacity,
                transform: `scale(${glowScale})`,
              }}
            />
            <div ref={pulseRef} style={{ position: 'absolute', inset: 0 }} />
            <svg width={264} height={264} viewBox="0 0 264 264" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx={132} cy={132} r={RING_RADIUS} fill="none" style={{ stroke: 'var(--n300)', strokeWidth: 6 }} />
              <circle
                ref={ringRef}
                cx={132}
                cy={132}
                r={RING_RADIUS}
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={offset}
                style={{ stroke: 'var(--accent)', strokeWidth: 6, strokeLinecap: 'round', filter: 'drop-shadow(0 0 9px rgba(206,245,133,.6))' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img ref={markRef} src={ASSET.markOnDark} alt="" style={{ width: 100, height: 100, display: 'block', filter: 'drop-shadow(0 6px 22px rgba(0,0,0,.7))' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, marginTop: 38 }}>
            <span style={{ fontSize: 62, fontWeight: 700, fontFamily: 'var(--display)', letterSpacing: '-.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {rounded}
            </span>
            <span style={{ fontSize: 26, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>%</span>
          </div>
          <div style={{ fontSize: 18, color: 'var(--fg-2)', marginTop: 8, height: 26 }}>{statusFor(percent, trackLabel)}</div>

          <div style={{ display: 'flex', gap: 26, marginTop: 26 }}>
            {CHECKLIST.map((item) => {
              const on = percent >= item.threshold
              return (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: on ? 1 : 0.5, color: on ? 'var(--fg)' : 'var(--fg-2)', transition: 'opacity .3s var(--e-out),color .3s var(--e-out)' }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 'var(--r-pill)',
                      border: `2px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`,
                      background: on ? 'var(--accent)' : 'transparent',
                      color: on ? 'var(--ink)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all .25s var(--e-out)',
                    }}
                  >
                    <Icon name="check" size={12} />
                  </span>
                  <span style={{ fontSize: 14 }}>{item.label}</span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 30, color: 'var(--fg-3)' }}>
            <Icon name="cpu-chip-01" size={15} />
            <span style={{ fontSize: 13 }}>{DOWNLOAD_COPY.footer}</span>
          </div>

          <div
            style={{
              marginTop: 32,
              opacity: done ? 1 : 0,
              pointerEvents: done ? 'auto' : 'none',
              transform: done ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity .4s var(--e-out),transform .4s var(--e-out)',
            }}
          >
            <PillButton label={DOWNLOAD_COPY.cta} iconRight="arrow-right" height={54} onClick={() => goTo('celebrate')} />
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
