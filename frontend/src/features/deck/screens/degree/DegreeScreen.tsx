import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { PillButton } from '../../../../shared/components/PillButton'
import { useReveal } from '../../../../shared/motion/useReveal'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { StepDots } from '../../components/StepDots'
import { DEGREE_COPY, TRACK_OPTIONS } from './degree.constants'
import { TrackCard } from './TrackCard'

const CHIP: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  height: 32,
  padding: '0 13px',
  borderRadius: 'var(--r-pill)',
  fontSize: 13,
}

export function DegreeScreen() {
  const revealRef = useReveal<HTMLDivElement>()
  const { user, updateUser } = useSession()
  const { goTo } = useDeckNav()

  return (
    <ScreenShell>
      <div ref={revealRef} style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <img
          src={ASSET.climbPeakface}
          alt=""
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '54%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '55% 28%',
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg,#000 42%,rgba(0,0,0,.5) 70%,rgba(0,0,0,.7) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: 540,
            flex: 'none',
            padding: '64px 0 64px 76px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div data-reveal style={{ marginBottom: 26 }}>
            <StepDots step={2} total={3} />
          </div>
          <span
            data-reveal
            style={{
              fontSize: 13,
              letterSpacing: '.14em',
              color: 'var(--fg-2)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            {DEGREE_COPY.eyebrow}
          </span>
          <h1
            data-reveal
            style={{ fontSize: 58, lineHeight: 1, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 22 }}
          >
            {DEGREE_COPY.title}
          </h1>
          <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 26 }}>
            <span style={{ ...CHIP, background: 'rgba(166,178,247,.14)', color: 'var(--lavender)', fontWeight: 600 }}>
              <Icon name="shield-tick" size={15} />
              Accredited
            </span>
            <span style={{ ...CHIP, background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--fg-2)', fontWeight: 500 }}>
              <Icon name="graduation-hat-02" size={15} />
              60 credits
            </span>
            <span style={{ ...CHIP, background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--fg-2)', fontWeight: 500 }}>
              <Icon name="clock" size={15} />
              Self-paced
            </span>
          </div>
          <p data-reveal style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)', maxWidth: 430 }}>
            {DEGREE_COPY.body}
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            flex: 1,
            padding: '56px 76px 56px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div data-reveal style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{DEGREE_COPY.pickFocus}</span>
            <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{DEGREE_COPY.changeAnytime}</span>
          </div>
          {TRACK_OPTIONS.map((option) => (
            <TrackCard
              key={option.id}
              option={option}
              selected={user.track === option.id}
              onSelect={() => updateUser({ track: option.id })}
            />
          ))}
          <div data-reveal style={{ marginTop: 14 }}>
            <PillButton label={DEGREE_COPY.cta} iconRight="arrow-right" onClick={() => goTo('download')} />
          </div>
          <p data-reveal style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 16 }}>
            {DEGREE_COPY.footnote}
          </p>
        </div>
      </div>
    </ScreenShell>
  )
}
