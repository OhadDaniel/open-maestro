type SegmentBarProps = {
  total: number
  filled: number
  partial?: number
  width?: number
  height?: number
  gap?: number
  partialRef?: React.RefObject<HTMLDivElement | null>
}

export function SegmentBar({
  total,
  filled,
  partial,
  width,
  height = 6,
  gap = 5,
  partialRef,
}: SegmentBarProps) {
  return (
    <div style={{ display: 'flex', gap, width }}>
      {Array.from({ length: total }, (_, index) => {
        const isFilled = index < filled
        const isPartial = partial !== undefined && index === filled
        return (
          <div
            key={index}
            style={{
              flex: 1,
              height,
              borderRadius: 'var(--r-pill)',
              background: isFilled ? 'var(--accent)' : 'var(--surface-2)',
              overflow: 'hidden',
            }}
          >
            {isPartial && (
              <div
                ref={partialRef}
                style={{
                  width: `${partial}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 'var(--r-pill)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
