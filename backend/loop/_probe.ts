import { MODELS, complete, completeJson } from '../eval/openai-client'
function t(){return Date.now()}
async function main(){
  console.log('models', JSON.stringify(MODELS))
  let s=t(); const tut=await complete(MODELS.tutor,'You are a terse Python tutor.','Say hi in one short sentence.'); console.log('tutor(qwen) ms', t()-s, '| len', tut.length)
  s=t(); const stu=await complete(MODELS.student,'You are a beginner student. One short line.','The tutor said hi. Reply.'); console.log('student(4o-mini) ms', t()-s, '| len', stu.length)
  s=t(); const jud=await completeJson(MODELS.judge,'Return strict JSON only.','Return {"ok":true} as JSON.'); console.log('judge(haiku) ms', t()-s, '|', JSON.stringify(jud))
}
main().catch(e=>{console.error('PROBE_FAIL', e?.status||'', e?.message||String(e)); process.exit(1)})
