import type { RunResult } from '../code/pyodide-loader'

export type LessonChatValue = {
  ready: boolean
  code: string
  setCode: (code: string) => void
  runResult: RunResult | null
  running: boolean
  runCount: number
  run: () => Promise<void>
  hasRun: boolean
}
