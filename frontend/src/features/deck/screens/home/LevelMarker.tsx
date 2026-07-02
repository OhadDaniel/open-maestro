import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import type { LevelNode, LevelNodeState } from './home.constants'

type LevelMarkerProps = {
  node: LevelNode
  state: LevelNodeState
}

export function LevelMarker({ node, state }: LevelMarkerProps) {
  const wrap: React.CSSProperties = {
    position: 'absolute',
    left: node.left,
    top: node.top,
    transform: 'translate(-50%,-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: state === 'current' ? 10 : 8,
    zIndex: state === 'current' ? 6 : 5,
  }
  const label = (
    <div style={{ textAlign: 'center', textShadow: '0 1px 6px #000' }}>
      <div style={{ fontSize: state === 'current' ? 13 : 12, fontWeight: state === 'current' ? 700 : 600, color: state === 'locked' ? 'var(--fg-2)' : 'var(--fg)' }}>{node.level}</div>
      <div style={{ fontSize: 11, color: state === 'locked' ? 'var(--fg-3)' : 'var(--fg-2)' }}>{node.title}</div>
    </div>
  )

  if (state === 'current') {
    return (
      <div style={wrap}>
        <div data-you style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 11px', borderRadius: 'var(--r-pill)', background: 'var(--accent)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, boxShadow: '0 6px 18px -4px rgba(206,245,133,.6)' }}>
            You're here
          </div>
          <div data-node style={{ position: 'relative', width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 28px -2px rgba(206,245,133,.8)' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--accent)', animation: 'om-ping 2.6s var(--e-out) infinite' }} />
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--accent)', animation: 'om-ping 2.6s var(--e-out) 1.3s infinite' }} />
            <img src={ASSET.mark} alt="" style={{ width: 26, height: 26 }} />
          </div>
        </div>
        {label}
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div style={wrap}>
        <div data-node style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(206,245,133,.18)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <Icon name="check" size={16} />
        </div>
        {label}
      </div>
    )
  }

  return (
    <div style={wrap}>
      <div data-node style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.05)', border: '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
        <Icon name={node.lockIcon ?? 'lock-03'} size={15} />
      </div>
      {label}
    </div>
  )
}
