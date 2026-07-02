import { readFileSync } from 'node:fs'
import { runConversation } from './conversation'
import { judgeConversation } from './judge-conversation'
import { PERSONAS } from './student-sim'
import { ALL_LESSONS } from './lessons'

async function main() {
  const cand = JSON.parse(readFileSync(new URL('./_resume_ckpt.json', import.meta.url), 'utf8')).candidate
  const persona = PERSONAS.find((p) => p.id === 'eager-beginner')!
  const lesson = ALL_LESSONS[0]
  const t0 = Date.now()
  const turns = await runConversation(persona, lesson, cand)
  const tConv = Date.now()
  const res = await judgeConversation(turns)
  const tJudge = Date.now()
  console.log('turns:', turns.length, 'conv_ms:', tConv - t0, 'judge_ms:', tJudge - tConv, 'total_ms:', tJudge - t0)
  console.log('pass:', res.filter((r) => r.pass).length, '/', res.length)
}
main().catch((e) => { console.log('ERR', (e as Error).message) })
