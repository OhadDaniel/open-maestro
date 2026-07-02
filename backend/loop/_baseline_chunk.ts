import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { BakedLesson } from '../../frontend/src/content/baked.types'
import { DEFAULT_POLICY } from '../../frontend/src/tutor/tutor-rules'
import OpenAI from 'openai'
import { MODELS } from '../eval/openai-client'
import { runConversation } from './conversation'
import type { CriterionResult } from './judge-conversation'
import { judgeConversation } from './judge-conversation'
import { ALL_LESSONS } from './lessons'
import { PERSONAS } from './student-sim'

const CKPT = '/sessions/wonderful-admiring-ramanujan/mnt/outputs/baseline_ckpt.json'
const CKPT_BAK = fileURLToPath(new URL('./baseline_ckpt.bak.json', import.meta.url))
const RESULT = '/sessions/wonderful-admiring-ramanujan/mnt/outputs/baseline_result.json'
const CONCURRENCY = Number(process.env.CHUNK_CONCURRENCY) || 6
const STOP_LAUNCH_MS = Number(process.env.CHUNK_STOP_LAUNCH_MS) || 15000
const PERCENT = 100

type Judged = { persona: string; lesson: string; results: CriterionResult[] }
type Ckpt = Record<string, Judged>

function selectLessons(): BakedLesson[] {
  const raw = Number(process.env.BENCH_LESSON_LIMIT)
  if (!Number.isFinite(raw) || raw <= 0) {
    return ALL_LESSONS
  }
  return ALL_LESSONS.slice(0, Math.min(Math.floor(raw), ALL_LESSONS.length))
}

function load(): Ckpt {
  if (existsSync(CKPT)) {
    return JSON.parse(readFileSync(CKPT, 'utf8')) as Ckpt
  }
  if (existsSync(CKPT_BAK)) {
    return JSON.parse(readFileSync(CKPT_BAK, 'utf8')) as Ckpt
  }
  return {}
}

function save(ckpt: Ckpt): void {
  const serialized = JSON.stringify(ckpt)
  writeFileSync(CKPT, serialized)
  writeFileSync(CKPT_BAK, serialized)
}

async function main(): Promise<void> {
  const lessons = selectLessons()
  const cells = PERSONAS.flatMap((persona) =>
    lessons.map((lesson) => ({ persona, lesson, key: `${persona.id}__${lesson.lesson.id}` })),
  )
  const ckpt = load()
  const remaining = cells.filter((cell) => !ckpt[cell.key])
  const probeMax = Number(process.env.CHUNK_PROBE_MAX_MS)
  if (Number.isFinite(probeMax) && probeMax > 0 && remaining.length > 0) {
    const probeClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: probeMax,
      maxRetries: 0,
    })
    const probeStart = Date.now()
    try {
      await probeClient.chat.completions.create(
        {
          model: MODELS.tutor,
          max_tokens: 4,
          messages: [{ role: 'user', content: 'ping' }],
        },
        { signal: AbortSignal.timeout(probeMax) },
      )
    } catch {
      console.log(`GATE slow probe>~${probeMax}ms; skipping wave. done ${cells.length - remaining.length}/${cells.length}`)
      return
    }
    console.log(`GATE ok probe=${Date.now() - probeStart}ms`)
  }
  const start = Date.now()
  let cursor = 0
  const worker = async (): Promise<void> => {
    while (Date.now() - start < STOP_LAUNCH_MS) {
      const index = cursor
      cursor += 1
      if (index >= remaining.length) {
        return
      }
      const cell = remaining[index]
      const turns = await runConversation(cell.persona, cell.lesson, DEFAULT_POLICY)
      const results = await judgeConversation(turns)
      ckpt[cell.key] = { persona: cell.persona.id, lesson: cell.lesson.lesson.id, results }
      save(ckpt)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, remaining.length) }, () => worker()),
  )
  const doneCount = cells.filter((cell) => ckpt[cell.key]).length
  console.log(`CKPT ${doneCount}/${cells.length}`)
  if (doneCount === cells.length) {
    let pass = 0
    let total = 0
    const failures: { persona: string; lesson: string; id: string; reason: string }[] = []
    for (const key of Object.keys(ckpt)) {
      const run = ckpt[key]
      for (const result of run.results) {
        total += 1
        if (result.pass) {
          pass += 1
        } else {
          failures.push({ persona: run.persona, lesson: run.lesson, id: result.id, reason: result.reason })
        }
      }
    }
    const score = total === 0 ? 0 : Math.round((pass / total) * PERCENT)
    writeFileSync(RESULT, JSON.stringify({ score, pass, total, failures }, null, 2))
    console.log(`COMPLETE score=${score}% pass=${pass}/${total} failures=${failures.length}`)
  }
}

main().catch((error: unknown) => {
  console.error('chunk failed:', error)
  process.exit(1)
})
