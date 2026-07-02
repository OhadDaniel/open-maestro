import { Icon } from '../../../../shared/components/Icon'
import { CODE_LINES } from './lesson.constants'

export function CodeCard() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }} data-reveal>
      <div style={{ width: 32, flex: 'none' }} />
      <div style={{ maxWidth: 460, width: '100%', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border)', background: '#141413' }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', color: 'var(--fg-2)' }}>PYTHON</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-2)' }}>
            <Icon name="copy-06" size={13} />
            Copy
          </span>
        </div>
        <div style={{ display: 'flex', padding: '12px 0', fontFamily: 'Menlo, monospace', fontSize: 13, lineHeight: '21px' }}>
          <div style={{ padding: '0 10px 0 14px', textAlign: 'right', color: 'var(--n500)', userSelect: 'none' }}>1<br />2</div>
          <div style={{ paddingRight: 14, whiteSpace: 'pre' }}>
            {CODE_LINES.map((line, index) => (
              <div key={index}>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} style={token.color ? { color: token.color } : undefined}>{token.text}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
