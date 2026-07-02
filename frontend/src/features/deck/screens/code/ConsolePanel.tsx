import { Icon } from '../../../../shared/components/Icon'
import type { RunResult } from '../../../code/pyodide-loader'
import { CODE_SCREEN_COPY, CONSOLE_MAX_HEIGHT } from './code.constants'

type ConsolePanelProps = {
  open: boolean
  result: RunResult | null
}

export function ConsolePanel({ open, result }: ConsolePanelProps) {
  return (
    <div style={{ flex: 'none', maxHeight: open ? CONSOLE_MAX_HEIGHT : 0, opacity: open ? 1 : 0, overflow: 'hidden', borderTop: '1px solid var(--border)', background: '#000', transition: 'max-height .44s var(--e-out),opacity .3s var(--e-out)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderBottom: '1px solid var(--border)' }}>
        <Icon name="play-square" size={14} style={{ color: 'var(--fg-3)' }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{CODE_SCREEN_COPY.consoleLabel}</span>
      </div>
      <div style={{ padding: '14px 18px', fontFamily: 'Menlo, monospace', fontSize: 13, lineHeight: '22px', color: 'var(--fg-2)' }}>
        <div style={{ color: 'var(--n500)' }}>$ python main.py</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: 'var(--fg)' }}>{result?.output ?? ''}</pre>
        {result !== null && <div style={{ color: 'var(--n500)' }}>[Finished in 0.1s]</div>}
      </div>
    </div>
  )
}
