const PYODIDE_VERSION = 'v314.0.2'
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

export type RunResult = { output: string; ok: boolean }

type PyodideStdHandler = { batched: (text: string) => void }

type PyodideStdinHandler = { stdin: () => string }

type PyodideInterface = {
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (handler: PyodideStdHandler) => void
  setStderr: (handler: PyodideStdHandler) => void
  setStdin: (handler: PyodideStdinHandler) => void
}

type LoadPyodide = (config: { indexURL: string }) => Promise<PyodideInterface>

declare global {
  interface Window {
    loadPyodide?: LoadPyodide
  }
}

let runtime: PyodideInterface | null = null
let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (scriptPromise !== null) {
    return scriptPromise
  }
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${PYODIDE_BASE}pyodide.js`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Python runtime'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (runtime !== null) {
    return runtime
  }
  await loadScript()
  if (!window.loadPyodide) {
    throw new Error('Python runtime unavailable')
  }
  runtime = await window.loadPyodide({ indexURL: PYODIDE_BASE })
  return runtime
}

function makeStdin(lines: readonly string[]): () => string {
  let index = 0
  return () => {
    const line = lines[index] ?? ''
    index += 1
    return line
  }
}

export async function runPython(
  code: string,
  stdinLines: readonly string[] = [],
): Promise<RunResult> {
  const pyodide = await getPyodide()
  let output = ''
  const append = (text: string) => {
    output += `${text}\n`
  }
  pyodide.setStdout({ batched: append })
  pyodide.setStderr({ batched: append })
  pyodide.setStdin({ stdin: makeStdin(stdinLines) })
  try {
    await pyodide.runPythonAsync(code)
    return { output, ok: true }
  } catch (error) {
    return { output: `${output}${String(error)}`, ok: false }
  }
}
