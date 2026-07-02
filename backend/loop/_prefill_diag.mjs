import OpenAI from 'openai'
import { readFileSync } from 'node:fs'
const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
const accum = readFileSync('/sessions/wizardly-charming-franklin/mnt/outputs/iter3/_cand_accum.txt','utf8').replace(/\s+$/,'')
try {
  const r = await client.chat.completions.create({
    model: 'anthropic/claude-opus-4.8', max_tokens: 500, stream: false,
    messages: [
      { role: 'system', content: 'Return strict minified JSON only.' },
      { role: 'user', content: 'Return the improved policy JSON now.' },
      { role: 'assistant', content: accum.slice(0, 200) },
    ],
  })
  console.log('OK', r.choices?.[0]?.message?.content?.slice(0,80))
} catch (e) {
  console.log('status=', e?.status)
  console.log('error=', JSON.stringify(e?.error ?? e?.response?.data ?? String(e)).slice(0, 800))
}
