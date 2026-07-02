import OpenAI from 'openai'
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs'

const KEY = process.env.OPENROUTER_API_KEY
const client = new OpenAI({ apiKey: KEY, baseURL: 'https://openrouter.ai/api/v1' })
const RESEARCHER = 'anthropic/claude-opus-4.8'

const STATE_PATH = new URL('./loop-state.json', import.meta.url)
const CKPT_DIR = '/sessions/wizardly-charming-franklin/mnt/outputs/iter3'
const ACCUM = `${CKPT_DIR}/_cand_accum.txt`
const CAND = `${CKPT_DIR}/_iter_cand.json`
const TIME_BUDGET_MS = 38000
const MAX_TOKENS = 4000

function isPolicy(p) {
  return p && typeof p.persona === 'string' &&
    Array.isArray(p.progressionRules) && p.progressionRules.every(r => typeof r === 'string') &&
    Array.isArray(p.exemplars) && p.exemplars.every(i => i && typeof i.tone === 'string' && typeof i.student === 'string' && typeof i.tutor === 'string')
}
function parseLoose(t) {
  const c = t.trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
  return JSON.parse(c)
}
function summarizeFailures(failures) {
  const by = new Map()
  for (const f of failures) {
    const e = by.get(f.id) ?? { count: 0, examples: [] }
    e.count += 1
    if (e.examples.length < 3) e.examples.push(`[${f.persona}/${f.lesson}] ${f.reason}`)
    by.set(f.id, e)
  }
  return [...by.entries()].sort((a,b)=>b[1].count-a[1].count)
    .map(([id,e])=>`- ${id} (${e.count} fails): ${e.examples.join(' | ')}`).join('\n')
}

const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'))
const system = 'You improve a coding-tutor policy so it teaches better. Keep everything that works and fix the listed failures with minimal, surgical edits. Return STRICT JSON with EXACTLY these keys: persona (string), progressionRules (array of strings), exemplars (array of {tone, student, tutor}). No other keys, no prose. Return MINIFIED JSON on a single line with no unnecessary whitespace.'
const user = [
  'Current policy:', JSON.stringify(state.bestPolicy, null, 2),
  'Failing behaviors across many simulated student conversations, grouped by criterion (most frequent first) — fix these:',
  summarizeFailures(state.bestFailures),
  'Return the improved policy JSON now.',
].join('\n\n')

let accum = existsSync(ACCUM) ? readFileSync(ACCUM, 'utf8').replace(/\s+$/,'') : ''

// If we already have a complete, valid candidate, finish immediately.
if (accum) {
  try { const p = parseLoose(accum); if (isPolicy(p)) { writeFileSync(CAND + '.tmp', JSON.stringify(p, null, 2)); renameSync(CAND + '.tmp', CAND); console.log('DONE cand already complete len=' + accum.length); process.exit(0) } } catch {}
}

const messages = [{ role: 'system', content: system }, { role: 'user', content: user }]
if (accum) messages.push({ role: 'assistant', content: accum })

const ac = new AbortController()
const timer = setTimeout(() => ac.abort(), TIME_BUDGET_MS)
let added = 0, finish = null
try {
  const stream = await client.chat.completions.create(
    { model: RESEARCHER, max_tokens: MAX_TOKENS, stream: true, messages },
    { signal: ac.signal },
  )
  for await (const ev of stream) {
    const d = ev.choices?.[0]?.delta?.content ?? ''
    if (d) { accum += d; added += d.length }
    if (ev.choices?.[0]?.finish_reason) finish = ev.choices[0].finish_reason
  }
} catch (e) {
  if (e?.name !== 'AbortError' && ac.signal.aborted !== true) { /* other error */ console.log('STREAM_ERR ' + (e?.message || e)) }
} finally {
  clearTimeout(timer)
}
writeFileSync(ACCUM + '.tmp', accum); renameSync(ACCUM + '.tmp', ACCUM)

let ok = false
try { const p = parseLoose(accum); if (isPolicy(p)) { writeFileSync(CAND + '.tmp', JSON.stringify(p, null, 2)); renameSync(CAND + '.tmp', CAND); ok = true } } catch {}
console.log(`${ok ? 'DONE' : 'PARTIAL'} added=${added} totalLen=${accum.length} finish=${finish} candValid=${ok}`)
