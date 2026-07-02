import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { TutorPolicy } from '../../frontend/src/tutor/tutor-rules'
import { DEFAULT_POLICY } from '../../frontend/src/tutor/tutor-rules'
import { MODELS, completeJson } from '../eval/openai-client'
import type { Failure } from './evaluate'
import { evaluateBench } from './evaluate'

const BENCH_VERSION = 3
const MAX_FAILURE_EXAMPLES = 3
const STATE_PATH = fileURLToPath(new URL('./loop-state.json', import.meta.url))
const POLICY_OUT = fileURLToPath(new URL('./best-policy.json', import.meta.url))

type HistoryEntry = { iteration: number; score: number; kept: boolean }
type LoopState = {
  benchVersion: number
  iteration: number
  bestScore: number
  bestPolicy: TutorPolicy
  bestFailures: Failure[]
  history: HistoryEntry[]
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

function saveState(state: LoopState): void {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
}

async function writeBaseline(): Promise<void> {
  const base = await evaluateBench(DEFAULT_POLICY)
  const state: LoopState = {
    benchVersion: BENCH_VERSION,
    iteration: 0,
    bestScore: base.score,
    bestPolicy: DEFAULT_POLICY,
    bestFailures: base.failures,
    history: [{ iteration: 0, score: base.score, kept: true }],
  }
  saveState(state)
  writeFileSync(POLICY_OUT, JSON.stringify(DEFAULT_POLICY, null, 2))
  console.log(`baseline (bench v${BENCH_VERSION}): ${base.score}%  (${base.failures.length} failing checks)`)
}

async function main(): Promise<void> {
  if (!existsSync(STATE_PATH)) {
    await writeBaseline()
    return
  }
  const state = JSON.parse(readFileSync(STATE_PATH, 'utf8')) as LoopState
  if (state.benchVersion !== BENCH_VERSION) {
    await writeBaseline()
    return
  }

  const candidate = await propose(state.bestPolicy, state.bestFailures)
  if (candidate === null) {
    console.log('proposal was invalid JSON, skipping this iteration')
    return
  }
  const trial = await evaluateBench(candidate)
  state.iteration += 1
  const kept = trial.score > state.bestScore
  if (kept) {
    state.bestScore = trial.score
    state.bestPolicy = candidate
    state.bestFailures = trial.failures
    writeFileSync(POLICY_OUT, JSON.stringify(candidate, null, 2))
  }
  state.history.push({ iteration: state.iteration, score: trial.score, kept })
  saveState(state)
  console.log(
    `iter ${state.iteration}: candidate ${trial.score}% vs best ${state.bestScore}% -> ${kept ? 'KEPT ✅' : 'discarded'}`,
  )
}

main().catch((error: unknown) => {
  console.error('autoresearch failed:', error)
  process.exit(1)
})
