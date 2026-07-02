import { Icon } from '../../../../shared/components/Icon'
import { usePaneSlide } from './usePaneSlide'
import { ConsolePanel } from './ConsolePanel'
import { CODE_SCREEN_COPY } from './code.constants'
import type { RunResult } from '../../../code/pyodide-loader'

type CodeEditorPaneProps = {
  code: string
  onCodeChange: (code: string) => void
  onRun: () => void
  onBack: () => void
  running: boolean
  consoleOpen: boolean
  result: RunResult | null
}

export function CodeEditorPane({ code, onCodeChange, onRun, onBack, running, consoleOpen, result }: CodeEditorPaneProps) {
  const ref = usePaneSlide<HTMLDivElement>()
  const lineCount = code.split('\n').length

  return (
    <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0e0e0d' }}>
      <div style={{ height: 62, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '0 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'Menlo, monospace', fontSize: 14, color: 'var(--fg-2)' }}>{CODE_SCREEN_COPY.fileName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={onRun} disabled={running} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 18px', borderRadius: 'var(--r-pill)', border: 'none', background: 'var(--accent)', color: 'var(--ink)', fontSize: 14, fontWeight: 600, cursor: running ? 'default' : 'pointer', opacity: running ? 0.7 : 1 }}>
            <Icon name="play" size={15} />
            {running ? CODE_SCREEN_COPY.starting : CODE_SCREEN_COPY.run}
          </button>
          <button type="button" onClick={onBack} style={{ width: 36, height: 36, borderRadius: 'var(--r-pill)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', fontFamily: 'Menlo, monospace', fontSize: 14, lineHeight: '26px', padding: '18px 0', overflow: 'auto' }}>
        <div style={{ padding: '0 14px 0 20px', textAlign: 'right', color: 'var(--n500)', userSelect: 'none' }}>
          {Array.from({ length: lineCount }, (_, index) => <div key={index}>{index + 1}</div>)}
        </div>
        <textarea
          value={code}
          spellCheck={false}
          onChange={(event) => onCodeChange(event.target.value)}
          style={{ flex: 1, marginRight: 18, border: 'none', outline: 'none', resize: 'none', background: 'transparent', color: 'var(--fg)', fontFamily: 'inherit', fontSize: 14, lineHeight: '26px', whiteSpace: 'pre', overflow: 'hidden' }}
        />
      </div>
      <ConsolePanel open={consoleOpen} result={result} />
    </div>
  )
}
