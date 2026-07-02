import { useCallback, useState } from 'react'
import type { RunResult } from './pyodide-loader'
import { runPython } from './pyodide-loader'

export type PyodideStatus = 'idle' | 'loading' | 'ready' | 'error'

type UsePyodide = {
  status: PyodideStatus
  lastResult: RunResult | null
  run: (code: string) => Promise<RunResult>
}

export function usePyodide(): UsePyodide {
  const [status, setStatus] = useState<PyodideStatus>('idle')
  const [lastResult, setLastResult] = useState<RunResult | null>(null)

  const run = useCallback(async (code: string) => {
    setStatus((prev) => (prev === 'ready' ? prev : 'loading'))
    try {
      const result = await runPython(code)
      setStatus('ready')
      setLastResult(result)
      return result
    } catch {
      const failure: RunResult = {
        output: 'Could not start the Python runtime. Check your connection and try again.',
        ok: false,
      }
      setStatus('error')
      setLastResult(failure)
      return failure
    }
  }, [])

  return { status, lastResult, run }
}
