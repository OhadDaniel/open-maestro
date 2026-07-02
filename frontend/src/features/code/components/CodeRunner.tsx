import { useState } from 'react'
import { usePyodide } from '../usePyodide'

type CodeRunnerProps = {
  initialCode: string
  onSubmit: (code: string, output: string) => void
}

export function CodeRunner({ initialCode, onSubmit }: CodeRunnerProps) {
  const [code, setCode] = useState(initialCode)
  const { status, lastResult, run } = usePyodide()
  const busy = status === 'loading'

  return (
    <div className="code">
      <div className="code-toolbar">
        <span className="code-lang">Python</span>
        <div className="code-actions">
          <button type="button" className="btn" disabled={busy} onClick={() => run(code)}>
            {busy ? 'Starting Python…' : 'Run'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || lastResult === null}
            onClick={() => onSubmit(code, lastResult?.output ?? '')}
          >
            Submit
          </button>
        </div>
      </div>
      <textarea
        className="code-editor"
        value={code}
        spellCheck={false}
        placeholder="Start typing your code here…"
        onChange={(event) => setCode(event.target.value)}
      />
      <div className="code-output">
        <span className="code-output-label">Output</span>
        <pre className="code-output-body">{lastResult?.output ?? ''}</pre>
      </div>
    </div>
  )
}
