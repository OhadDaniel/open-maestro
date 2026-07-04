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

const WELCOME_LESSON_ID = 'welcome-to-py101'
const WELCOME_CANNED_HELLO = 'Hello, PY101!'

const EXPLICIT_ADVANCE_RE =
  /\b(continue|next|got\s+it|i\s+understand|move\s+on|let'?s\s+go|let'?s\s+continue|skip)\b/i

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

// Returns outcome indices that this run demonstrates, based on v1 heuristics.
function detectDemonstratedOutcomes(
  baked: BakedLesson,
  runEvidence: RunEvidence | null,
  runOk: boolean,
  practicingIndex: number,
): number[] {
  if (!runOk || runEvidence === null || runEvidence.quotedStrings.length === 0) return []

  const { quotedStrings, output } = runEvidence
  const printSucceeded = quotedStrings.some((s) => output.includes(s))
  if (!printSucceeded) return []

  const n = baked.lesson.masteryOutcomes.length

  if (baked.lesson.id === WELCOME_LESSON_ID) {
    // Canned hello → outcome 1 only; custom text → outcomes 1 and 2
    const onlyCanned = quotedStrings.every((s) => s === WELCOME_CANNED_HELLO)
    return onlyCanned ? [1].filter((i) => i < n) : [1, 2].filter((i) => i < n)
  }

  // General: demonstrate the currently practicing outcome
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

  // 2) Explicit text claim
  if (practicingIndex >= 0 && practicingIndex < total && EXPLICIT_ADVANCE_RE.test(userMessage)) {
    if (wouldBeAllMastered(session, [practicingIndex], total)) {
      return { kind: 'lesson-complete' }
    }
    return { kind: 'claimed', outcomeIndex: practicingIndex }
  }

  return null
}
