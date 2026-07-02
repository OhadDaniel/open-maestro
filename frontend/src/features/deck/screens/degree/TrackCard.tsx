import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { Icon } from '../../../../shared/components/Icon'
import type { TrackOption } from './degree.constants'

type TrackCardProps = {
  option: TrackOption
  selected: boolean
  onSelect: () => void
}

export function TrackCard({ option, selected, onSelect }: TrackCardProps) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const reduced = useReducedMotion()
  const wasSelected = useRef(selected)

  useEffect(() => {
    const node = ref.current
    if (node === null || reduced) {
      return
    }
    if (selected && !wasSelected.current) {
      animate(node, { scale: [0.985, 1], duration: 280, ease: EASE.outBack })
    }
    wasSelected.current = selected
  }, [selected, reduced])

  return (
    <button
      ref={ref}
      type="button"
      data-reveal
      onClick={onSelect}
      style={{
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        marginBottom: 12,
        borderRadius: 'var(--r-card)',
        border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
        background: selected ? 'var(--accent-soft)' : 'var(--surface)',
        boxShadow: selected ? '0 0 34px -12px rgba(206,245,133,.5)' : 'none',
        cursor: 'pointer',
        transition: 'all .18s var(--e-productive)',
      }}
    >
      <span
        style={{
          width: 46,
          height: 46,
          flex: 'none',
          borderRadius: 12,
          background: selected ? 'rgba(206,245,133,.14)' : 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: selected ? 'var(--accent)' : 'var(--fg-2)',
        }}
      >
        <Icon name={option.icon} size={24} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: 'var(--fg)' }}>
          {option.title}
        </span>
        <span style={{ display: 'block', fontSize: 13, color: 'var(--fg-2)', marginTop: 3 }}>
          {option.sub}
        </span>
      </span>
      <span
        style={{
          width: 24,
          height: 24,
          flex: 'none',
          borderRadius: 'var(--r-pill)',
          background: selected ? 'var(--accent)' : 'transparent',
          border: selected ? 'none' : '2px solid var(--border-strong)',
          color: selected ? 'var(--ink)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all .18s var(--e-productive)',
        }}
      >
        <Icon name="check" size={15} />
      </span>
    </button>
  )
}
