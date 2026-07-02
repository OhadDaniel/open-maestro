import type { BakedLesson } from '../../frontend/src/content/baked.types'
import type { TutorPolicy } from '../../frontend/src/tutor/tutor-rules'
import { DEFAULT_POLICY } from '../../frontend/src/tutor/tutor-rules'
import { mapWithConcurrency } from './concurrency'
import { runConversation } from './conversation'
import { judgeConversation } from './judge-conversation'
import { ALL_LESSONS } from './lessons'
import type { StudentPersona } from './student-sim'
import { PERSONAS } from './student-sim'

const CONCURRENCY = 4
const PERCENT = 100

export type Failure = { persona: string; lesson: string; id: string; reason: string }
export type BenchResult = { score: number; pass: number; total: number; failures: Failure[] }

type Cell = { persona: StudentPersona; lesson: BakedLesson }

function selectLessons(): BakedLesson[] {
  const raw = Number(process.env.BENCH_LESSON_LIMIT)
  if (!Number.isFinite(raw) || raw <= 0) {
    return ALL_LESSONS
  }
  return ALL_LESSONS.slice(0, Math.min(Math.floor(raw), ALL_LESSONS.length))
}

export async function evaluateBench(policy: TutorPolicy = DEFAULT_POLICY): Promise<BenchResult> {
  const lessons = selectLessons()
  const cells: Cell[] = PERSONAS.flatMap((persona) =>
    lessons.map((lesson) => ({ persona, lesson })),
  )
  let completed = 0
  let errored = 0
  const judged = await mapWithConcurrency(cells, CONCURRENCY, async (cell) => {
    completed += 1
    process.stdout.write(`\r  graded ${completed}/${cells.length} conversations`)
    try {
      const turns = await runConversation(cell.persona, cell.lesson, policy)
      const results = await judgeConversation(turns)
      return { persona: cell.persona.id, lesson: cell.lesson.lesson.id, results }
    } catch {
      errored += 1
      return null
    }
  })
  process.stdout.write('\n')
  if (errored > 0) {
    process.stdout.write(`  (${errored} conversations errored and were skipped)\n`)
  }
  let pass = 0
  let total = 0
  const failures: Failure[] = []
  for (const run of judged) {
    if (run === null) {
      continue
    }
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
  return { score, pass, total, failures }
}
