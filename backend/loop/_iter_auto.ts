import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { BakedLesson } from '../../frontend/src/content/baked.types'
import { emptyProfile } from '../../frontend/src/memory/learner-profile'
import { createSession } from '../../frontend/src/tutor/session'
import { buildTutorRequest } from '../../frontend/src/tutor/tutor-engine'
import type { TutorPolicy } from '../../frontend/src/tutor/tutor-rules'
import type { ChatTurn } from '../eval/openai-client'
import { MODELS, completeChat, completeJson } from '../eval/openai-client'
import { mapWithConcurrency } from './concurrency'
import type { Failure } from './evaluate'
import type { CriterionResult } from './judge-conversation'
import { judgeConversation } from './judge-conversation'
import { ALL_LESSONS } from './lessons'
import type { StudentPersona } from './student-sim'
import { PERSONAS, studentReply } from './student-sim'

const BENCH_VERSION = 3
const MAX_FAILURE_EXAMPLES = 3
const PERCENT = 100
const MAX_EXCHANGES = 4
const DONE = '[DONE]'
const RETRIES = 2
const EVAL_CONC = Number(process.env.EVAL_CONC) > 0 ? Math.floor(Number(process.env.EVAL_CONC)) : 8
const JUDGE_CONC = Number(process.env.JUDGE_CONC) > 0 ? Math.floor(Number(process.env.JUDGE_CONC)) : 12
const BUDGET_MS = Number(process.env.BUDGET_MS) > 0 ? Math.floor(Number(process.env.BUDGET_MS)) : 38000

const STATE_PATH = fileURLToPath(new URL('./loop-state.json', import.meta.url))
const POLICY_OUT = fileURLToPath(new URL('./best-policy.json', import.meta.url))
const CKPT_DIR = process.env.ITER_CKPT_DIR ?? fileURLToPath(new URL('./ckpt-auto', import.meta.url))
const CAND_PATH = `${CKPT_DIR}/_iter_cand.json`
const CONV_PATH = `${CKPT_DIR}/_iter_conv.json`
const JUDGE_PATH = `${CKPT_DIR}/_iter_judge.json`
const STATUS_PATH = `${CKPT_DIR}/_iter_status.json`

type HistoryEntry = { iteration: number; score: number; kept: boolean }
type LoopState = {
  benchVersion: number
  iteration: number
  bestScore: number
  bestPolicy: TutorPolicy
  bestFailures: Failure[]
  history: HistoryEntry[]
}
type Cell = { persona: StudentPersona; lesson: BakedLesson }
type ConvState = { turns: ChatTurn[]; exchanges: number; finished: boolean }
type ConvStore = Record<string, ConvState>
type JudgeStore = Record<string, CriterionResult[]>

let tmpCounter = 0
function atomicWrite(path: string, value: unknown): void {
  const tmp = `${path}.tmp.${process.pid}.${(tmpCounter += 1)}`
  writeFileSync(tmp, JSON.stringify(value, null, 2))
  renameSync(tmp, path)
}
function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function isPolicy(value: unknown): value is TutorPolicy {
  const policy = value as TutorPolicy
  return (
    typeof policy?.persona === 'string' &&
    Array.isArray(policy.progressionRules) &&
    policy.progressionRules.every((rule) => typeof rule === 'string') &&
    Array.isArray(policy.exemplars) &&
    policy.exemplars.every(
      (item) =>
        typeof item?.tone === 'string' &&
        typeof item?.student === 'string' &&
        typeof item?.tutor === 'string',
    )
  )
}

function summarizeFailures(failures: Failure[]): string {
  const byCriterion = new Map<string, { count: number; examples: string[] }>()
  for (const failure of failures) {
    const entry = byCriterion.get(failure.id) ?? { count: 0, examples: [] }
    entry.count += 1
    if (entry.examples.length < MAX_FAILURE_EXAMPLES) {
      entry.examples.push(`[${failure.persona}/${failure.lesson}] ${failure.reason}`)
    }
    byCriterion.set(failure.id, entry)
  }
  return [...byCriterion.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id, entry]) => `- ${id} (${entry.count} fails): ${entry.examples.join(' | ')}`)
    .join('\n')
}

async function propose(policy: TutorPolicy, failures: Failure[]): Promise<TutorPolicy | null> {
  const system =
    'You improve a coding-tutor policy so it teaches better. Keep everything that works and fix the listed failures with minimal, surgical edits. Return STRICT JSON with EXACTLY these keys: persona (string), progressionRules (array of strings), exemplars (array of {tone, student, tutor}). No other keys, no prose. Return MINIFIED JSON on a single line with no unnecessary whitespace.'
  const user = [
    'Current policy:',
    JSON.stringify(policy, null, 2),
    'Failing behaviors across many simulated student conversations, grouped by criterion (most frequent first) — fix these:',
    summarizeFailures(failures),
    'Return the improved policy JSON now.',
  ].join('\n\n')
  const output = await completeJson(MODELS.researcher, system, user)
  return isPolicy(output) ? output : null
}

function selectLessons(): BakedLesson[] {
  const raw = Number(process.env.BENCH_LESSON_LIMIT)
  if (!Number.isFinite(raw) || raw <= 0) {
    return ALL_LESSONS
  }
  return ALL_LESSONS.slice(0, Math.min(Math.floor(raw), ALL_LESSONS.length))
}
function buildCells(): Cell[] {
  const lessons = selectLessons()
  return PERSONAS.flatMap((persona) => lessons.map((lesson) => ({ persona, lesson })))
}
function keyOf(cell: Cell): string {
  return `${cell.persona.id}::${cell.lesson.lesson.id}`
}
function renderTranscript(turns: ChatTurn[]): string {
  return turns
    .map((turn) => `${turn.role === 'assistant' ? 'Maestro' : 'Student'}: ${turn.content}`)
    .join('\n')
}
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)))
    }
  }
  throw lastError
}

function endsWithAssistant(conv: ConvState): boolean {
  const last = conv.turns[conv.turns.length - 1]
  return last !== undefined && last.role === 'assistant'
}

async function advanceOneExchange(cell: Cell, conv: ConvState, candidate: TutorPolicy): Promise<void> {
  if (!endsWithAssistant(conv)) {
    const session = createSession(cell.lesson.lesson.id)
    const profile = emptyProfile()
    const request = buildTutorRequest(cell.lesson, session, profile, conv.turns, candidate)
    const assistant = await completeChat(MODELS.tutor, request.system, conv.turns)
    conv.turns.push({ role: 'assistant', content: assistant })
  }
  const student = await studentReply(cell.persona, renderTranscript(conv.turns))
  conv.exchanges += 1
  if (student.includes(DONE)) {
    conv.finished = true
    return
  }
  conv.turns.push({ role: 'user', content: student })
  if (conv.exchanges >= MAX_EXCHANGES) {
    conv.finished = true
  }
}

function finalize(state: LoopState, cells: Cell[], candidate: TutorPolicy, judged: JudgeStore): void {
  let pass = 0
  let total = 0
  const failures: Failure[] = []
  for (const cell of cells) {
    for (const result of judged[keyOf(cell)]) {
      total += 1
      if (result.pass) {
        pass += 1
      } else {
        failures.push({ persona: cell.persona.id, lesson: cell.lesson.lesson.id, id: result.id, reason: result.reason })
      }
    }
  }
  const score = total === 0 ? 0 : Math.round((pass / total) * PERCENT)
  state.iteration += 1
  const kept = score > state.bestScore
  if (kept) {
    state.bestScore = score
    state.bestPolicy = candidate
    state.bestFailures = failures
    atomicWrite(POLICY_OUT, candidate)
  }
  state.history.push({ iteration: state.iteration, score, kept })
  atomicWrite(STATE_PATH, state)
  atomicWrite(STATUS_PATH, { status: 'done', iteration: state.iteration, candidateScore: score, bestScore: state.bestScore, kept })
  for (const path of [CAND_PATH, CONV_PATH, JUDGE_PATH]) {
    try {
      rmSync(path, { force: true })
    } catch {
      void 0
    }
  }
  console.log(`NEXT=done iter ${state.iteration}: candidate ${score}% vs best ${state.bestScore}% -> ${kept ? 'KEPT' : 'discarded'}`)
}

const HARD_MS = Number(process.env.HARD_MS) > 0 ? Math.floor(Number(process.env.HARD_MS)) : 32000

async function main(): Promise<void> {
  const watchdog = setTimeout(() => {
    console.log('NEXT=continue watchdog-exit')
    process.exit(0)
  }, HARD_MS)
  watchdog.unref()
  mkdirSync(CKPT_DIR, { recursive: true })
  const state = readJson<LoopState>(STATE_PATH)
  if (state.benchVersion !== BENCH_VERSION) {
    console.log(`ERROR benchVersion ${state.benchVersion} != ${BENCH_VERSION}; baseline needed`)
    process.exit(1)
  }
  const cells = buildCells()

  if (!existsSync(CAND_PATH)) {
    const candidate = await propose(state.bestPolicy, state.bestFailures)
    if (candidate === null) {
      atomicWrite(STATUS_PATH, { status: 'proposal-invalid' })
      console.log('NEXT=abort proposal was invalid JSON, skipping this iteration')
      return
    }
    atomicWrite(CAND_PATH, candidate)
    console.log('NEXT=eval proposal ok; candidate saved')
    return
  }
  const candidate = readJson<TutorPolicy>(CAND_PATH)

  const conv: ConvStore = existsSync(CONV_PATH) ? readJson<ConvStore>(CONV_PATH) : {}
  for (const cell of cells) {
    if (!conv[keyOf(cell)]) {
      conv[keyOf(cell)] = { turns: [{ role: 'user', content: cell.persona.opener }], exchanges: 0, finished: false }
    }
  }

  const deadline = Date.now() + BUDGET_MS

  const runCellToEnd = async (cell: Cell): Promise<void> => {
    const st = conv[keyOf(cell)]
    try {
      while (!st.finished && Date.now() < deadline) {
        await withRetry(() => advanceOneExchange(cell, st, candidate))
        atomicWrite(CONV_PATH, conv)
      }
    } catch (error) {
      console.error(`cell ${keyOf(cell)} failed: ${(error as Error).message}`)
    }
  }

  while (Date.now() < deadline) {
    const notFinished = cells.filter((cell) => !conv[keyOf(cell)].finished)
    if (notFinished.length === 0) {
      break
    }
    const wave = notFinished.slice(0, EVAL_CONC)
    await mapWithConcurrency(wave, EVAL_CONC, (cell) => runCellToEnd(cell))
    atomicWrite(CONV_PATH, conv)
  }

  const stillOpen = cells.filter((cell) => !conv[keyOf(cell)].finished).length
  if (stillOpen > 0) {
    const done = cells.length - stillOpen
    console.log(`NEXT=eval convFinished=${done}/${cells.length} (budget hit)`)
    return
  }

  const judged: JudgeStore = existsSync(JUDGE_PATH) ? readJson<JudgeStore>(JUDGE_PATH) : {}
  while (Date.now() < deadline) {
    const unjudged = cells.filter((cell) => !judged[keyOf(cell)])
    if (unjudged.length === 0) {
      break
    }
    const wave = unjudged.slice(0, JUDGE_CONC)
    await mapWithConcurrency(wave, JUDGE_CONC, async (cell) => {
      try {
        const results = await withRetry(() => judgeConversation(conv[keyOf(cell)].turns))
        judged[keyOf(cell)] = results
      } catch (error) {
        console.error(`judge ${keyOf(cell)} failed: ${(error as Error).message}`)
      }
    })
    atomicWrite(JUDGE_PATH, judged)
  }

  const remaining = cells.filter((cell) => !judged[keyOf(cell)]).length
  if (remaining > 0) {
    const done = cells.length - remaining
    console.log(`NEXT=judge judged=${done}/${cells.length} (budget hit)`)
    return
  }

  finalize(state, cells, candidate, judged)
}

main().catch((error: unknown) => {
  console.error('iter failed:', error)
  process.exit(1)
})
