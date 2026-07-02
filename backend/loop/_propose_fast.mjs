import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const key = process.env.OPENROUTER_API_KEY
const STATE = new URL('./loop-state.json', import.meta.url)
const CKPT = process.env.ITER_CKPT_DIR ?? '/sessions/sleepy-loving-franklin/mnt/outputs/iterrun'
mkdirSync(CKPT, { recursive: true })
const CAND = `${CKPT}/_iter_cand.json`
const MODEL = 'anthropic/claude-opus-4.8'
const MAX_TOKENS = 4000
const MAX_EX = 3

const state = JSON.parse(readFileSync(STATE, 'utf8'))

function summarizeFailures(failures) {
  const by = new Map()
  for (const f of failures) {
    const e = by.get(f.id) ?? { count: 0, examples: [] }
    e.count += 1
    if (e.examples.length < MAX_EX) e.examples.push(`[${f.persona}/${f.lesson}] ${f.reason}`)
    by.set(f.id, e)
  }
  return [...by.entries()].sort((a, b) => b[1].count - a[1].count)
    .map(([id, e]) => `- ${id} (${e.count} fails): ${e.examples.join(' | ')}`).join('\n')
}
function isPolicy(p) {
  return p && typeof p.persona === 'string' && Array.isArray(p.progressionRules) &&
    p.progressionRules.every((r) => typeof r === 'string') && Array.isArray(p.exemplars) &&
    p.exemplars.every((i) => i && typeof i.tone === 'string' && typeof i.student === 'string' && typeof i.tutor === 'string')
}
function parseLoose(t) {
  const c = t.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  return JSON.parse(c)
}

const system = 'You improve a coding-tutor policy so it teaches better. Keep everything that works and fix the listed failures with minimal, surgical edits. Return STRICT JSON with EXACTLY these keys: persona (string), progressionRules (array of strings), exemplars (array of {tone, student, tutor}). No other keys, no prose. Return MINIFIED JSON on a single line with no unnecessary whitespace.'
const user = [
  'Current policy:', JSON.stringify(state.bestPolicy, null, 2),
  'Failing behaviors across many simulated student conversations, grouped by criterion (most frequent first) — fix these:',
  summarizeFailures(state.bestFailures),
  'Return the improved policy JSON now.',
].join('\n\n')

const t0 = Date.now()
const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
})
const ms = Date.now() - t0
if (!r.ok) {
  console.log(`PROPOSE_HTTP_${r.status} in ${ms}ms :: ${(await r.text()).slice(0, 300)}`)
  process.exit(2)
}
const j = await r.json()
const content = j.choices?.[0]?.message?.content ?? ''
const usage = j.usage ?? {}
let policy = null
try { policy = parseLoose(content) } catch (e) { console.log(`PARSE_FAIL in ${ms}ms :: ${e.message} :: ${content.slice(0, 200)}`); process.exit(3) }
if (!isPolicy(policy)) { console.log(`INVALID_POLICY in ${ms}ms :: keys=${Object.keys(policy || {})}`); process.exit(4) }
writeFileSync(CAND, JSON.stringify(policy, null, 2))
console.log(`PROPOSE_OK in ${ms}ms; completion_tokens=${usage.completion_tokens ?? '?'} prompt_tokens=${usage.prompt_tokens ?? '?'}; saved ${CAND}`)
