import OpenAI from 'openai'
const c = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
const t0 = Date.now()
let first = null, chars = 0
const stream = await c.chat.completions.create({
  model: 'anthropic/claude-opus-4.8',
  max_tokens: 900,
  stream: true,
  messages: [
    { role: 'system', content: 'Return strict JSON only.' },
    { role: 'user', content: 'Return a JSON object with keys a..j, each a one-sentence string about teaching. JSON only.' },
  ],
})
for await (const ev of stream) {
  const d = ev.choices?.[0]?.delta?.content ?? ''
  if (d && first === null) { first = Date.now() - t0 }
  chars += d.length
}
const tot = Date.now() - t0
console.log(`first_token_ms=${first} total_ms=${tot} chars=${chars} chars_per_s=${(chars/(tot/1000)).toFixed(1)}`)
