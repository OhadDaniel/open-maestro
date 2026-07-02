type RingProgressProps = {
  size: number
  percent: number
  stroke?: number
  trackColor?: string
  label?: string
  labelSize?: number
}

export function RingProgress({
  size,
  percent,
  stroke = 4,
  trackColor = 'var(--n300, #3c3c3a)',
  label,
  labelSize = 12,
}: RingProgressProps) {
  const radius = size / 2 - stroke
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(100, percent)) / 100)

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" style={{ stroke: trackColor, strokeWidth: stroke }} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: 'var(--accent)', strokeWidth: stroke, strokeLinecap: 'round' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: labelSize,
          fontWeight: 700,
        }}
      >
        {label ?? `${Math.round(percent)}%`}
      </div>
    </div>
  )
}
