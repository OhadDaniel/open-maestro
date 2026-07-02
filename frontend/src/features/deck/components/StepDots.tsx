const DOT_BASE: React.CSSProperties = { width: 24, height: 4, borderRadius: 'var(--r-pill)' }

type StepDotsProps = {
  step: number
  total: number
}

export function StepDots({ step, total }: StepDotsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            style={{ ...DOT_BASE, background: index < step ? 'var(--accent)' : 'var(--border)' }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: 12,
          letterSpacing: '.16em',
          color: 'var(--fg-3)',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginLeft: 6,
        }}
      >
        Step {step} of {total}
      </span>
    </div>
  )
}
