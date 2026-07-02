import type { GetKnowOption } from './getknow.constants'

type AnswerCardProps = {
  option: GetKnowOption
  selected: boolean
  width?: number
  onSelect: () => void
}

export function AnswerCard({ option, selected, width, onSelect }: AnswerCardProps) {
  return (
    <button
      type="button"
      data-gk-item
      onClick={onSelect}
      style={{
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '18px 20px',
        width,
        borderRadius: 'var(--r-card)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        background: selected ? 'rgba(206,245,133,.08)' : 'var(--surface)',
        cursor: 'pointer',
        transition: 'border-color .18s var(--e-out),background .18s var(--e-out),transform .18s var(--e-out)',
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg)' }}>{option.title}</span>
      <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>{option.sub}</span>
    </button>
  )
}
