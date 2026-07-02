import OpenAI from 'openai'
const c = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
async function call(model, mt, prompt){
  const t=Date.now()
  try{ const r=await c.chat.completions.create({model,max_tokens:mt,messages:[{role:'user',content:prompt}]});
    return {model, ms:Date.now()-t, len:(r.choices[0]?.message?.content||'').length} }
  catch(e){ return {model, ms:Date.now()-t, err:(e?.status||'')+' '+(e?.message||'').slice(0,80)} }
}
for(let i=0;i<3;i++){ console.log(JSON.stringify(await call('qwen/qwen-2.5-coder-32b-instruct',512,'Explain a Python variable to a beginner in 3 sentences.'))) }
console.log(JSON.stringify(await call('openai/gpt-4o-mini',256,'Reply as a curious beginner student in one sentence.')))
console.log(JSON.stringify(await call('anthropic/claude-haiku-4.5',800,'Return JSON {"ok":true} only.')))
