import { useState } from 'react'
import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { MaestroMark } from '../../../../shared/components/MaestroMark'
import { PillButton } from '../../../../shared/components/PillButton'
import { UnderlineInput } from '../../../../shared/components/UnderlineInput'
import { useReveal } from '../../../../shared/motion/useReveal'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { StepDots } from '../../components/StepDots'
import { ACCOUNT_COPY, WAYPOINTS } from './account.constants'
import { useWaypointPulse } from './useWaypointPulse'

export function AccountScreen() {
  const revealRef = useReveal<HTMLDivElement>()
  const walkRef = useWaypointPulse<HTMLDivElement>()
  const { user, updateUser } = useSession()
  const { goTo } = useDeckNav()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const firstName = name.trim().split(' ')[0]

  const submit = () => {
    updateUser({ name: name.trim(), email })
    goTo('degree')
  }

  return (
    <ScreenShell>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '62%', overflow: 'hidden' }}>
        <img
          src={ASSET.climbAccount}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '58% 44%',
            animation: 'om-drift 17s ease-in-out infinite alternate',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg,#000 33%,rgba(0,0,0,.5) 52%,rgba(0,0,0,0) 74%)',
        }}
      />
      <div ref={walkRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {WAYPOINTS.map((point) => (
          <span
            key={point.left}
            data-waypoint
            style={{
              position: 'absolute',
              left: point.left,
              top: point.top,
              width: 9,
              height: 9,
              borderRadius: 'var(--r-pill)',
              background: 'var(--accent)',
              boxShadow: '0 0 12px var(--accent)',
              opacity: 0.15,
            }}
          />
        ))}
      </div>

      <div
        ref={revealRef}
        style={{
          position: 'absolute',
          left: 96,
          top: 0,
          bottom: 0,
          width: 556,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div data-reveal style={{ marginBottom: 30 }}>
          <StepDots step={1} total={3} />
        </div>
        <div data-reveal style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <MaestroMark size={48} glow="lavender" />
          <p style={{ fontSize: 17, color: 'var(--fg-2)', lineHeight: 1.5 }}>
            Hi — I'm <span style={{ color: 'var(--fg)', fontWeight: 600 }}>Maestro</span>, your tutor.
            <br />
            Let's get you set up.
          </p>
        </div>
        <div data-reveal style={{ marginBottom: 34 }}>
          <UnderlineInput
            label={ACCOUNT_COPY.namePrompt}
            value={name}
            onChange={setName}
            placeholder={ACCOUNT_COPY.namePlaceholder}
            fontSize={36}
          />
        </div>
        <div data-reveal style={{ marginBottom: 38 }}>
          <UnderlineInput
            label={ACCOUNT_COPY.emailPrompt}
            value={email}
            onChange={setEmail}
            placeholder={ACCOUNT_COPY.emailPlaceholder}
            type="email"
            fontSize={28}
          />
        </div>
        <div data-reveal style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <PillButton label={ACCOUNT_COPY.cta} iconRight="arrow-right" height={54} onClick={submit} />
          <span
            style={{
              fontSize: 15,
              color: 'var(--fg-3)',
              opacity: firstName.length > 0 ? 1 : 0,
              transition: 'opacity .3s var(--e-productive)',
            }}
          >
            {firstName.length > 0 ? `Nice to meet you, ${firstName}.` : ''}
          </span>
        </div>
        <div
          data-reveal
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 34, color: 'var(--fg-3)' }}
        >
          <Icon name="lock-03" size={14} />
          <span style={{ fontSize: 13 }}>{ACCOUNT_COPY.trust}</span>
        </div>
      </div>
    </ScreenShell>
  )
}
