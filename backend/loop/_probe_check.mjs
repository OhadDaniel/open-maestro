import OpenAI from 'openai'
const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
async function one(model){
  const t0=Date.now()
  try{
    const r=await client.chat.completions.create({model,max_tokens:16,messages:[{role:'user',content:'Reply with the word OK only.'}]})
    return {model, ms:Date.now()-t0, content:(r.choices[0]?.message?.content||'').slice(0,40)}
  }catch(e){ return {model, ms:Date.now()-t0, error:(e?.status||'')+' '+(e?.message||String(e)).slice(0,160)} }
}
const out = await one('qwen/qwen-2.5-coder-32b-instruct')
console.log(JSON.stringify(out))
