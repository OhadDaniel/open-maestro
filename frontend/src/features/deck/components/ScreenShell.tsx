import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../deck.constants'

type ScreenShellProps = {
  children: React.ReactNode
  background?: string
}

export function ScreenShell({ children, background = '#000' }: ScreenShellProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        overflow: 'hidden',
        background,
        color: 'var(--fg)',
        borderRadius: 'var(--r-card)',
      }}
    >
      {children}
    </div>
  )
}
