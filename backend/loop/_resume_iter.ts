import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { TutorPolicy } from '../../frontend/src/tutor/tutor-rules'
import { DEFAULT_POLICY } from '../../frontend/src/tutor/tutor-rules'
import { MODELS, completeJson } from '../eval/openai-client'
import type { Failure, BenchResult } from './evaluate'
import type { CriterionResult } from './judge-conversation'
import { judgeConversation } from './judge-conversation'
import { runConversation } from './conversation'
import { ALL_LESSONS } from './lessons'
import type { BakedLesson } from '../../frontend/src/content/baked.types'
import type { StudentPersona } from './student-sim'
import { PERSONAS } from './student-sim'

const BENCH_VERSION = 3
const MAX_FAILURE_EXAMPLES = 3
const PERCENT = 100
const STATE_PATH = fileURLToPath(new URL('./loop-state.json', import.meta.url))
const POLICY_OUT = fileURLToPath(new URL('./best-policy.json', import.meta.url))
const CKPT_PATH = fileURLToPath(new URL('./_resume_ckpt.json', import.meta.url))

const HARD_EXIT_MS = Number(process.env.RESUME_HARD_EXIT_MS) > 0 ? Number(process.env.RESUME_HARD_EXIT_MS) : 40000
const CONCURRENCY = Number(process.env.RESUME_CONCURRENCY) > 0 ? Number(process.env.RESUME_CONCURRENCY) : 10
const MAX_CELL_ATTEMPTS = 3

type HistoryEntry = { iteration: number; score: number; kept: boolean }
type LoopState = {
  benchVersion: number
  iteration: number
  bestScore: number
  bestPolicy: TutorPolicy
  bestFailures: Failure[]
  history: HistoryEntry[]
}
type Checkpoint = {
  candidate: TutorPolicy
  cells: Record<string, CriterionResult[]>
  attempts: Record<string, number>
}
type Cell = { persona: StudentPersona; lesson: BakedLesson }

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
    'You improve a coding-tutor policy so it teaches better on a SMALL 3-billion-parameter model that runs on the student\'s own device. Small models follow short, concrete, unambiguous instructions well, but get confused by long, nuanced, or overlapping rules and start ignoring them. Your default move is to SIMPLIFY: merge or delete overlapping rules, cut nuance, make each rule short and literal, and keep the whole policy tight. Only add words when they clearly prevent a listed failure. Fix the listed failures while making the policy as small and direct as you can. Return STRICT JSON with EXACTLY these keys: persona (string), progressionRules (array of strings), exemplars (array of {tone, student, tutor}). No other keys, no prose.'
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

function cellKey(cell: Cell): string {
  return `${cell.persona.id}__${cell.lesson.lesson.id}`
}

function loadState(): LoopState {
  return JSON.parse(readFileSync(STATE_PATH, 'utf8')) as LoopState
}

function loadCheckpoint(): Checkpoint | null {
  if (!existsSync(CKPT_PATH)) {
    return null
  }
  return JSON.parse(readFileSync(CKPT_PATH, 'utf8')) as Checkpoint
}

function saveCheckpoint(ckpt: Checkpoint): void {
  writeFileSync(CKPT_PATH, JSON.stringify(ckpt))
}

function scoreFromCells(cells: Cell[], results: Record<string, CriterionResult[]>): BenchResult {
  let pass = 0
  let total = 0
  const failures: Failure[] = []
  for (const cell of cells) {
    const cellResults = results[cellKey(cell)] ?? []
    for (const result of cellResults) {
      total += 1
      if (result.pass) {
        pass += 1
      } else {
        failures.push({ persona: cell.persona.id, lesson: cell.lesson.lesson.id, id: result.id, reason: result.reason })
      }
    }
  }
  const score = total === 0 ? 0 : Math.round((pass / total) * PERCENT)
  return { score, pass, total, failures }
}

function finalize(state: LoopState, cells: Cell[], ckpt: Checkpoint): void {
  const trial = scoreFromCells(cells, ckpt.cells)
  state.iteration += 1
  const kept = trial.score > state.bestScore
  if (kept) {
    state.bestScore = trial.score
    state.bestPolicy = ckpt.candidate
    state.bestFailures = trial.failures
    writeFileSync(POLICY_OUT, JSON.stringify(ckpt.candidate, null, 2))
  }
  state.history.push({ iteration: state.iteration, score: trial.score, kept })
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
  rmSync(CKPT_PATH, { force: true })
  console.log(
    `iter ${state.iteration}: candidate ${trial.score}% vs best ${state.bestScore}% -> ${kept ? 'KEPT ✅' : 'discarded'}`,
  )
  console.log('DONE')
}

function countDone(cells: Cell[], ckpt: Checkpoint): number {
  return cells.filter((cell) => cellKey(cell) in ckpt.cells).length
}

async function main(): Promise<void> {
  const state = loadState()
  if (state.benchVersion !== BENCH_VERSION) {
    console.log(`ERROR: state benchVersion ${state.benchVersion} != ${BENCH_VERSION}; baseline path not supported by resumable driver`)
    return
  }

  let ckpt = loadCheckpoint()
  if (ckpt === null) {
    const candidate = await propose(state.bestPolicy, state.bestFailures)
    if (candidate === null) {
      console.log('proposal was invalid JSON, skipping this iteration')
      console.log('DONE')
      return
    }
    ckpt = { candidate, cells: {}, attempts: {} }
    saveCheckpoint(ckpt)
    console.log('candidate proposed and cached')
  }

  const cells = buildCells()
  const total = cells.length
  const activeCkpt = ckpt
  const pending = cells.filter((cell) => !(cellKey(cell) in activeCkpt.cells))
  if (pending.length === 0) {
    finalize(state, cells, activeCkpt)
    return
  }

  const deadline = setTimeout(() => {
    console.log(`PARTIAL ${countDone(cells, activeCkpt)}/${total} cells done (candidate cached, resume to continue)`)
    process.exit(0)
  }, HARD_EXIT_MS)
  deadline.unref()

  let cursor = 0
  let aborted: string | null = null
  const worker = async (): Promise<void> => {
    while (aborted === null) {
      const index = cursor
      cursor += 1
      if (index >= pending.length) {
        return
      }
      const cell = pending[index] as Cell
      const key = cellKey(cell)
      try {
        const turns = await runConversation(cell.persona, cell.lesson, activeCkpt.candidate)
        const results = await judgeConversation(turns)
        activeCkpt.cells[key] = results
        saveCheckpoint(activeCkpt)
      } catch (error) {
        activeCkpt.attempts[key] = (activeCkpt.attempts[key] ?? 0) + 1
        saveCheckpoint(activeCkpt)
        if (activeCkpt.attempts[key] >= MAX_CELL_ATTEMPTS) {
          aborted = `cell ${key} failed ${MAX_CELL_ATTEMPTS}x: ${(error as Error).message}`
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, () => worker()))
  clearTimeout(deadline)

  if (aborted !== null) {
    console.log(`ERROR: ${aborted}`)
    return
  }

  const doneCount = countDone(cells, activeCkpt)
  if (doneCount >= total) {
    finalize(state, cells, activeCkpt)
    return
  }
  console.log(`PARTIAL ${doneCount}/${total} cells done (candidate cached, resume to continue)`)
}

main().catch((error) => {
  console.log(`ERROR: ${(error as Error).message}`)
  process.exit(1)
})
