import { Icon } from '../../shared/components/Icon'
import type { NavItem } from './appnav.constants'

type NavRowProps = {
  item: NavItem
  active: boolean
  onClick?: () => void
}

export function NavRow({ item, active, onClick }: NavRowProps) {
  const color = item.locked ? 'var(--fg-3)' : active ? 'var(--fg)' : 'var(--fg-2)'
  return (
    <div
      onClick={item.locked ? undefined : onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        height: 38,
        padding: '0 12px',
        borderRadius: 10,
        cursor: item.locked ? 'default' : 'pointer',
        color,
        background: active ? 'var(--surface-2)' : 'transparent',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
      }}
    >
      <Icon name={item.icon} size={18} />
      {item.label}
      {item.locked && (
        <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
          <Icon name="lock-03" size={14} />
        </span>
      )}
    </div>
  )
}
