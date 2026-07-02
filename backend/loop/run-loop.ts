import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { evaluateBench } from './evaluate'

const RESULTS_PATH = fileURLToPath(new URL('./loop-results.json', import.meta.url))

async function main(): Promise<void> {
  const { score, pass, total, failures } = await evaluateBench()
  const byCriterion = new Map<string, number>()
  for (const failure of failures) {
    byCriterion.set(failure.id, (byCriterion.get(failure.id) ?? 0) + 1)
  }
  console.log(`\n=== BENCH SCORE: ${score}%  (${pass}/${total}) ===`)
  for (const [id, count] of [...byCriterion.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}x FAIL ${id}`)
  }
  writeFileSync(RESULTS_PATH, JSON.stringify(failures, null, 2))
}

main().catch((error: unknown) => {
  console.error('loop failed:', error)
  process.exit(1)
})
