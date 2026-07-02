import { ScreenShell } from '../components/ScreenShell'

export function Placeholder({ id }: { id: string }) {
  return (
    <ScreenShell>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--fg-3)',
          fontSize: 20,
        }}
      >
        {id}
      </div>
    </ScreenShell>
  )
}
