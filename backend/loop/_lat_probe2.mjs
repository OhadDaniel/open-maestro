import OpenAI from 'openai'
const c = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
async function timeIt(label, model, maxTok, sys, usr){
  const t=Date.now()
  try{
    const r = await c.chat.completions.create({model, max_tokens:maxTok, messages:[{role:'system',content:sys},{role:'user',content:usr}]})
    const ms=Date.now()-t
    const txt=(r.choices[0]?.message?.content||'').slice(0,40).replace(/\n/g,' ')
    console.log(`${label}: ${ms}ms  ok  "${txt}"`)
  }catch(e){ console.log(`${label}: ${Date.now()-t}ms  ERR ${e.status||''} ${e.message?.slice(0,120)}`) }
}
await Promise.all([
  timeIt('tutor(qwen)','qwen/qwen-2.5-coder-32b-instruct',512,'You are a coding tutor.','Say hi in one short sentence.'),
  timeIt('student(4o-mini)','openai/gpt-4o-mini',512,'You are a student.','Say hi in one short sentence.'),
  timeIt('judge(haiku)','anthropic/claude-haiku-4.5',256,'You are a judge.','Reply with the word OK.'),
])
