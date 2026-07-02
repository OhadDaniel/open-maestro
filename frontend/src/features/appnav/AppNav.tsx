import { ASSET } from '../../shared/assets'
import { useDeckNav } from '../deck/DeckContext'
import { useSession } from '../session/SessionContext'
import { APPNAV_WIDTH, LOCKED_NAV, PRIMARY_NAV, type NavKey } from './appnav.constants'
import { NavRow } from './NavRow'

type AppNavProps = {
  active: NavKey
}

export function AppNav({ active }: AppNavProps) {
  const { goTo } = useDeckNav()
  const { user } = useSession()
  const firstName = user.name.trim().split(' ')[0] || 'Ray'
  const initial = firstName[0].toUpperCase()

  return (
    <div
      style={{
        width: APPNAV_WIDTH,
        flex: 'none',
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
        zIndex: 9,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px 22px' }}>
        <img src={ASSET.logoOnDark} alt="Maestro" style={{ height: 21, display: 'block' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {PRIMARY_NAV.map((item) => (
          <NavRow
            key={item.label}
            item={item}
            active={item.key === active}
            onClick={item.goto ? () => goTo(item.goto!) : undefined}
          />
        ))}
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '14px 10px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {LOCKED_NAV.map((item) => (
          <NavRow key={item.label} item={item} active={false} />
        ))}
      </div>
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '14px 8px 4px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--sunset)',
            color: '#441F06',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            flex: 'none',
          }}
        >
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {firstName} Chen
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>AAS · AI Engineering</div>
        </div>
      </div>
    </div>
  )
}
