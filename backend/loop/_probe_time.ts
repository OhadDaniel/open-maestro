import { MODELS, complete, completeJson } from '../eval/openai-client'
const t = (n:number)=>`${(n/1000).toFixed(1)}s`
async function main(){
  let s=Date.now()
  const a= await complete(MODELS.tutor,'You are a terse coding tutor.','Say hi in one short sentence.')
  console.log('tutor(qwen):',t(Date.now()-s),JSON.stringify(a).slice(0,80))
  s=Date.now()
  const b= await complete(MODELS.student,'You are a student, reply in <=8 words.','Tutor said hi. Reply.')
  console.log('student(4o-mini):',t(Date.now()-s),JSON.stringify(b).slice(0,80))
  s=Date.now()
  const c= await completeJson(MODELS.judge,'Return strict JSON only.','Return {"ok":true} as JSON.')
  console.log('judge(haiku):',t(Date.now()-s),JSON.stringify(c).slice(0,80))
}
main().catch(e=>{console.error('PROBE_ERR', e?.status||'', e?.message||String(e)); process.exit(1)})
