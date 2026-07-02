import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DEFAULT_POLICY } from '../../frontend/src/tutor/tutor-rules'

const BENCH_VERSION = 3
const RESULT = '/sessions/wonderful-admiring-ramanujan/mnt/outputs/baseline_result.json'
const STATE_PATH = fileURLToPath(new URL('./loop-state.json', import.meta.url))
const POLICY_OUT = fileURLToPath(new URL('./best-policy.json', import.meta.url))

type Failure = { persona: string; lesson: string; id: string; reason: string }
type Result = { score: number; pass: number; total: number; failures: Failure[] }

const result = JSON.parse(readFileSync(RESULT, 'utf8')) as Result

const state = {
  benchVersion: BENCH_VERSION,
  iteration: 0,
  bestScore: result.score,
  bestPolicy: DEFAULT_POLICY,
  bestFailures: result.failures,
  history: [{ iteration: 0, score: result.score, kept: true }],
}

writeFileSync(STATE_PATH, JSON.stringify(state, null, 2))
writeFileSync(POLICY_OUT, JSON.stringify(DEFAULT_POLICY, null, 2))
console.log(`WROTE baseline (bench v${BENCH_VERSION}): ${result.score}% (${result.failures.length} failing checks) pass=${result.pass}/${result.total}`)
