import { ASSET } from '../assets'

type MaestroMarkProps = {
  size: number
  glow?: 'lavender' | 'evergreen' | 'gold' | 'mixed'
  ring?: boolean
  dark?: boolean
  parallax?: boolean
  className?: string
  style?: React.CSSProperties
}

const GLOW_GRADIENT: Record<NonNullable<MaestroMarkProps['glow']>, string> = {
  lavender: 'radial-gradient(circle, rgba(166,178,247,.5), transparent 68%)',
  evergreen: 'radial-gradient(circle, rgba(206,245,133,.5), transparent 68%)',
  gold: 'radial-gradient(circle, rgba(234,173,94,.45), transparent 68%)',
  mixed:
    'radial-gradient(circle, rgba(206,245,133,.38), rgba(166,178,247,.22) 55%, transparent 72%)',
}

export function MaestroMark({
  size,
  glow = 'lavender',
  ring = false,
  dark = true,
  parallax = false,
  className,
  style,
}: MaestroMarkProps) {
  const glowInset = Math.round(-size * 0.21)
  const ringInset = Math.round(-size * 0.18)

  return (
    <div
      className={className}
      {...(parallax ? { 'data-plx-orb': true } : {})}
      style={{ position: 'relative', width: size, height: size, flex: 'none', ...style }}
    >
      <div
        style={{
          position: 'absolute',
          inset: glowInset,
          background: GLOW_GRADIENT[glow],
          filter: 'blur(7px)',
          animation: 'om-breathe 4.5s var(--e-productive) infinite',
        }}
      />
      {ring && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: ringInset,
              borderRadius: '50%',
              border: '1px solid rgba(236,235,228,.13)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: ringInset,
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, transparent 0 72%, rgba(166,178,247,.65) 86%, transparent 96%)',
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
              animation: 'om-spin 22s linear infinite',
            }}
          />
        </>
      )}
      <img
        src={dark ? ASSET.markOnDark : ASSET.mark}
        alt="Maestro"
        style={{ position: 'relative', width: size, height: size, display: 'block' }}
      />
    </div>
  )
}
