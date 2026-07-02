import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ALL_LESSONS } from './lessons'
import { PERSONAS } from './student-sim'
import { runConversation } from './conversation'
import { judgeConversation } from './judge-conversation'
const t=(n:number)=>`${(n/1000).toFixed(1)}s`
const policy = JSON.parse(readFileSync(fileURLToPath(new URL('./best-policy.json',import.meta.url)),'utf8'))
async function main(){
  const persona = PERSONAS[0]; const lesson = ALL_LESSONS[0]
  let s=Date.now()
  const turns = await runConversation(persona, lesson, policy)
  const conv = Date.now()-s
  s=Date.now()
  const res = await judgeConversation(turns)
  const jud = Date.now()-s
  console.log('persona',persona.id,'lesson',lesson.lesson.id)
  console.log('exchanges(turns len):',turns.length,'conv:',t(conv),'judge:',t(jud),'CELL_TOTAL:',t(conv+jud))
  console.log('criteria judged:',res.length)
}
main().catch(e=>{console.error('CELL_ERR', e?.status||'', e?.message||String(e)); process.exit(1)})
