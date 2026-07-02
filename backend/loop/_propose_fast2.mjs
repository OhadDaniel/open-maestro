import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const key = process.env.OPENROUTER_API_KEY
const STATE = new URL('./loop-state.json', import.meta.url)
const CKPT = process.env.ITER_CKPT_DIR ?? '/sessions/sleepy-loving-franklin/mnt/outputs/iterrun'
mkdirSync(CKPT, { recursive: true })
const CAND = `${CKPT}/_iter_cand.json`
const MODEL = 'anthropic/claude-opus-4.8'
const MAX_TOKENS = 3000
const ABORT_MS = 42000
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

const currentExemplars = state.bestPolicy.exemplars.length
const currentRules = state.bestPolicy.progressionRules.length
const system = `You improve a coding-tutor policy so it teaches better. Make MINIMAL, SURGICAL edits: fix the listed failures while keeping everything that already works. Hard constraints: keep the policy about the SAME SIZE as the current one — do NOT lengthen the persona, keep at most ${currentRules} progressionRules and at most ${currentExemplars} exemplars, and keep every exemplar short. Return STRICT JSON with EXACTLY these keys: persona (string), progressionRules (array of strings), exemplars (array of {tone, student, tutor}). No other keys, no prose, no markdown. Output MINIFIED JSON on a SINGLE line with no unnecessary whitespace.`
const user = [
  'Current policy:', JSON.stringify(state.bestPolicy, null, 2),
  'Failing behaviors across many simulated student conversations, grouped by criterion (most frequent first) — fix these:',
  summarizeFailures(state.bestFailures),
  'Return the improved minified policy JSON now.',
].join('\n\n')

const controller = new AbortController()
const timer = setTimeout(() => controller.abort(), ABORT_MS)
const t0 = Date.now()
let r
try {
  r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    signal: controller.signal,
  })
} catch (e) {
  clearTimeout(timer)
  console.log(`ABORTED_OR_ERR in ${Date.now() - t0}ms :: ${e.name}: ${e.message}`)
  process.exit(5)
}
clearTimeout(timer)
const ms = Date.now() - t0
if (!r.ok) { console.log(`PROPOSE_HTTP_${r.status} in ${ms}ms :: ${(await r.text()).slice(0, 300)}`); process.exit(2) }
const j = await r.json()
const content = j.choices?.[0]?.message?.content ?? ''
const usage = j.usage ?? {}
const finish = j.choices?.[0]?.finish_reason
let policy = null
try { policy = parseLoose(content) } catch (e) { console.log(`PARSE_FAIL in ${ms}ms finish=${finish} ct=${usage.completion_tokens} :: ${e.message}`); process.exit(3) }
if (!isPolicy(policy)) { console.log(`INVALID_POLICY in ${ms}ms :: keys=${Object.keys(policy || {})}`); process.exit(4) }
writeFileSync(CAND, JSON.stringify(policy, null, 2))
console.log(`PROPOSE_OK in ${ms}ms finish=${finish} completion_tokens=${usage.completion_tokens} exemplars=${policy.exemplars.length} rules=${policy.progressionRules.length}; saved`)
