import { useMagnetic } from '../motion/useMagnetic'
import { Icon } from './Icon'

type PillVariant = 'primary' | 'ghost'

type PillButtonProps = {
  label: string
  onClick?: () => void
  variant?: PillVariant
  iconRight?: string
  iconLeft?: string
  magnetic?: boolean
  height?: number
  disabled?: boolean
  className?: string
}

export function PillButton({
  label,
  onClick,
  variant = 'primary',
  iconRight,
  iconLeft,
  magnetic = false,
  height = 56,
  disabled = false,
  className,
}: PillButtonProps) {
  const ref = useMagnetic<HTMLButtonElement>(magnetic)
  const isPrimary = variant === 'primary'

  return (
    <button
      ref={ref}
      type="button"
      className={`om-pill om-pill-${variant}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        height,
        padding: `0 ${isPrimary ? 30 : 24}px`,
        borderRadius: 'var(--r-pill)',
        border: isPrimary ? 'none' : '1px solid var(--border-strong)',
        background: isPrimary ? 'var(--accent)' : 'transparent',
        color: isPrimary ? 'var(--ink)' : 'var(--fg)',
        fontFamily: 'var(--sans)',
        fontSize: 17,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: isPrimary ? '0 12px 44px -8px rgba(206,245,133,.5)' : 'none',
      }}
    >
      {iconLeft && <Icon name={iconLeft} size={19} />}
      {label}
      {iconRight && <Icon name={iconRight} size={19} />}
    </button>
  )
}
