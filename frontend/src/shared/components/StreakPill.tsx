import { Icon } from './Icon'

type StreakPillProps = {
  days: number
  size?: 'sm' | 'md'
}

export function StreakPill({ days, size = 'md' }: StreakPillProps) {
  const height = size === 'md' ? 32 : 28
  const fontSize = size === 'md' ? 14 : 13
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height,
        padding: '0 12px',
        borderRadius: 'var(--r-pill)',
        background: 'rgba(255,139,98,.16)',
        color: 'var(--sunset)',
        fontSize,
        fontWeight: 600,
      }}
    >
      <Icon name="flame-02" size={size === 'md' ? 16 : 14} />
      {days}
    </span>
  )
}
