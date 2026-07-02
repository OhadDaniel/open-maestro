import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  EVERYDAY_MODEL,
  OURS_MODEL,
  everydayAnswer,
  ourAnswer,
} from './contestants'
import { judgeReply } from './judge'
import { SCENARIOS } from './scenarios'

const RESULTS_PATH = fileURLToPath(new URL('./results.json', import.meta.url))

function passed(results: { pass: boolean }[]): number {
  return results.filter((result) => result.pass).length
}

async function main(): Promise<void> {
  const graded = await Promise.all(
    SCENARIOS.map(async (scenario) => {
      const [ours, everyday] = await Promise.all([
        ourAnswer(scenario),
        everydayAnswer(scenario),
      ])
      const [oursJudged, everyJudged] = await Promise.all([
        judgeReply(scenario, ours),
        judgeReply(scenario, everyday),
      ])
      return { scenario, ours, everyday, oursJudged, everyJudged }
    }),
  )

  let oursPass = 0
  let everyPass = 0
  let total = 0
  for (const row of graded) {
    const n = row.scenario.rubric.length
    const oP = passed(row.oursJudged)
    const eP = passed(row.everyJudged)
    oursPass += oP
    everyPass += eP
    total += n
    console.log(`${row.scenario.id.padEnd(26)} ours ${oP}/${n}   everyday ${eP}/${n}`)
  }

  const oursPct = Math.round((oursPass / total) * 100)
  const everyPct = Math.round((everyPass / total) * 100)
  console.log('\n=== SCOREBOARD (teaching rubric, blind judge) ===')
  console.log(`Ours   — small model + our teaching design (${OURS_MODEL}): ${oursPct}%  (${oursPass}/${total})`)
  console.log(`Everyday — ${EVERYDAY_MODEL} used cold: ${everyPct}%  (${everyPass}/${total})`)

  writeFileSync(
    RESULTS_PATH,
    JSON.stringify(
      {
        oursPct,
        everyPct,
        oursModel: OURS_MODEL,
        everydayModel: EVERYDAY_MODEL,
        detail: graded,
      },
      null,
      2,
    ),
  )
}

main().catch((error: unknown) => {
  console.error('eval failed:', error)
  process.exit(1)
})
