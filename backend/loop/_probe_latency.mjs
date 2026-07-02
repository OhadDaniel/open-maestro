const key = process.env.OPENROUTER_API_KEY
const base = 'https://openrouter.ai/api/v1/chat/completions'

async function timeCall(label, model, maxTokens, messages) {
  const t0 = Date.now()
  try {
    const r = await fetch(base, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
    })
    const ms = Date.now() - t0
    if (!r.ok) {
      const body = await r.text()
      console.log(`${label} [${model}] HTTP ${r.status} in ${ms}ms :: ${body.slice(0, 200)}`)
      return { ms, ok: false, status: r.status }
    }
    const j = await r.json()
    const content = j.choices?.[0]?.message?.content ?? ''
    console.log(`${label} [${model}] OK in ${ms}ms, ${content.length} chars`)
    return { ms, ok: true }
  } catch (e) {
    const ms = Date.now() - t0
    console.log(`${label} [${model}] ERROR in ${ms}ms :: ${e.message}`)
    return { ms, ok: false }
  }
}

const sys = 'You are a helpful assistant.'
const usr = 'Say a short friendly hello to a beginner learning Python.'

const tutor = await timeCall('tutor', 'qwen/qwen-2.5-coder-32b-instruct', 512, [
  { role: 'system', content: sys }, { role: 'user', content: usr },
])
const student = await timeCall('student', 'openai/gpt-4o-mini', 512, [
  { role: 'system', content: sys }, { role: 'user', content: usr },
])
const judge = await timeCall('judge', 'anthropic/claude-haiku-4.5', 512, [
  { role: 'system', content: sys }, { role: 'user', content: usr },
])

console.log('\nSUMMARY(ms):', JSON.stringify({ tutor: tutor.ms, student: student.ms, judge: judge.ms }))
