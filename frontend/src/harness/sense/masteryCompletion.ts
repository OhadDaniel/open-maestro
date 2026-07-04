import type { BakedLesson } from '../../content/baked.types'
import type { TutorSession } from '../../content/session.types'

// ─── Public types ────────────────────────────────────────────────────────────

export type RunEvidence = {
  code: string
  output: string
  quotedStrings: string[]
}

export type CompletionSignal =
  | { kind: 'demonstrated'; outcomeIndex: number; evidence: RunEvidence }
  | { kind: 'claimed'; outcomeIndex: number }
  | { kind: 'lesson-complete'; evidence?: RunEvidence }

// ─── Constants ───────────────────────────────────────────────────────────────

const WELCOME_LESSON_ID = 'py101-w1-welcome'
const WELCOME_CANNED_HELLO = 'Hello, PY101!'

const EXPLICIT_ADVANCE_RE =
  /\b(continue|next|got\s+it|i\s+understand|move\s+on|let'?s\s+go|let'?s\s+continue|skip)\b/i

// Engagement replies that advance welcome orientation (outcome 0) without needing explicit "continue"
const WELCOME_ENGAGEMENT_RE = /\b(yes|ready|yeah|sure|ok|yep|let'?s\s+go)\b/i

// Matches the exact format CodeScreen sends: "I ran this code:\n\n{code}\n\nOutput:\n{output}"
const RUN_MESSAGE_RE = /^I ran this code:\n\n([\s\S]*?)\n\nOutput:\n([\s\S]*)$/

// ─── Exported helpers ────────────────────────────────────────────────────────

export function parseRunMessage(userMessage: string): RunEvidence | null {
  const match = RUN_MESSAGE_RE.exec(userMessage)
  if (match === null) return null
  const code = match[1] ?? ''
  const output = match[2]?.trim() ?? ''
  return { code, output, quotedStrings: extractPrintStrings(code) }
}

export function extractPrintStrings(code: string): string[] {
  const results: string[] = []
  const re = /print\s*\(\s*["']([^"']*)["']\s*\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    if (m[1] !== undefined) results.push(m[1])
  }
  return results
}

export function isSuccessfulRun(runResult?: { ok: boolean; output: string }): boolean {
  const out = runResult?.output?.trim() ?? ''
  return runResult?.ok === true && out.length > 0 && out !== '(no output)'
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function currentPracticingIndex(session: TutorSession): number {
  // First index not yet in masteredOutcomes (may equal total when all are done)
  let i = 0
  while (session.progress.masteredOutcomes.includes(String(i))) i++
  return i
}

function wouldBeAllMastered(
  session: TutorSession,
  indicesToMaster: number[],
  total: number,
): boolean {
  const mastered = new Set([
    ...session.progress.masteredOutcomes.map(Number),
    ...indicesToMaster,
  ])
  for (let i = 0; i < total; i++) {
    if (!mastered.has(i)) return false
  }
  return true
}

// ─── Per-lesson outcome evaluators ───────────────────────────────────────────

type LessonEvaluator = (code: string, output: string, outcomeIndex: number) => boolean

const LESSON_EVALUATORS: Record<string, LessonEvaluator> = {
  'py101-w1-unlocking-print-power-ups': (code, output, outcomeIndex) => {
    if (outcomeIndex === 0) {
      // Commas: print() with ≥2 comma-separated args AND non-empty output
      return /print\s*\([^)]*,[^)]*\)/.test(code) && output.trim().length > 0
    }
    if (outcomeIndex === 1) {
      // Newlines: ≥2 print() calls AND ≥2 non-empty output lines
      const printCount = (code.match(/print\s*\(/g) ?? []).length
      const outputLines = output.trim().split('\n').filter((l) => l.trim().length > 0).length
      return printCount >= 2 && outputLines >= 2
    }
    if (outcomeIndex === 2) {
      // + and *: string repetition or concatenation AND non-empty output
      const hasOp =
        /"[^"]*"\s*\*\s*\d/.test(code) ||
        /"[^"]*"\s*\+\s*"[^"]*"/.test(code) ||
        /'[^']*'\s*\*\s*\d/.test(code) ||
        /'[^']*'\s*\+\s*'[^']*'/.test(code)
      return hasOp && output.trim().length > 0
    }
    return false
  },
  'py101-w1-writing-your-first-program': (code, output, outcomeIndex) => {
    if (outcomeIndex === 0) {
      // Editor: any run that produces output
      return output.trim().length > 0
    }
    if (outcomeIndex === 1) {
      // Hello World exact OR ≥2 print calls with ≥2 output lines
      const hasExact =
        code.includes('print("Hello, world!")') || code.includes("print('Hello, world!')")
      const twoLines =
        (code.match(/print\s*\(/g) ?? []).length >= 2 &&
        output.trim().split('\n').filter((l) => l.trim().length > 0).length >= 2
      return hasExact || twoLines
    }
    return false
  },
}

// Returns outcome indices that this run demonstrates.
function detectDemonstratedOutcomes(
  baked: BakedLesson,
  runEvidence: RunEvidence | null,
  runOk: boolean,
  practicingIndex: number,
): number[] {
  if (!runOk || runEvidence === null) return []

  const { code, output, quotedStrings } = runEvidence
  const n = baked.lesson.masteryOutcomes.length

  if (baked.lesson.id === WELCOME_LESSON_ID) {
    if (quotedStrings.length === 0) return []
    const printSucceeded = quotedStrings.some((s) => output.includes(s))
    if (!printSucceeded) return []
    // Canned hello → outcome 1 only; custom text → outcomes 1 and 2
    const onlyCanned = quotedStrings.every((s) => s === WELCOME_CANNED_HELLO)
    return onlyCanned ? [1].filter((i) => i < n) : [1, 2].filter((i) => i < n)
  }

  // Per-lesson evaluator
  const evaluator = LESSON_EVALUATORS[baked.lesson.id]
  if (evaluator !== undefined) {
    if (practicingIndex >= 0 && practicingIndex < n && evaluator(code, output, practicingIndex)) {
      return [practicingIndex]
    }
    return []
  }

  // General fallback: print string heuristic
  if (quotedStrings.length === 0) return []
  const printSucceeded = quotedStrings.some((s) => output.includes(s))
  if (!printSucceeded) return []
  if (practicingIndex >= 0 && practicingIndex < n) return [practicingIndex]
  return []
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function evaluateMasteryTurn(input: {
  baked: BakedLesson
  session: TutorSession
  userMessage: string
  runResult?: { ok: boolean; output: string }
}): CompletionSignal | null {
  const { baked, session, userMessage, runResult } = input
  const total = baked.lesson.masteryOutcomes.length
  const practicingIndex = currentPracticingIndex(session)
  const runEvidence = parseRunMessage(userMessage)
  const runOk = isSuccessfulRun(runResult)

  // 1) Demonstration via run
  if (runOk && runEvidence) {
    const demonstrated = detectDemonstratedOutcomes(baked, runEvidence, runOk, practicingIndex)
    if (demonstrated.length > 0) {
      if (wouldBeAllMastered(session, demonstrated, total)) {
        return { kind: 'lesson-complete', evidence: runEvidence }
      }
      return {
        kind: 'demonstrated',
        outcomeIndex: Math.max(...demonstrated),
        evidence: runEvidence,
      }
    }
  }

  // 2) Welcome orientation engagement (outcome 0 only) — "yes", "ready", "sure", etc.
  if (
    baked.lesson.id === WELCOME_LESSON_ID &&
    practicingIndex === 0 &&
    WELCOME_ENGAGEMENT_RE.test(userMessage)
  ) {
    return { kind: 'claimed', outcomeIndex: 0 }
  }

  // 3) Explicit text claim
  if (practicingIndex >= 0 && practicingIndex < total && EXPLICIT_ADVANCE_RE.test(userMessage)) {
    if (wouldBeAllMastered(session, [practicingIndex], total)) {
      return { kind: 'lesson-complete' }
    }
    return { kind: 'claimed', outcomeIndex: practicingIndex }
  }

  return null
}
