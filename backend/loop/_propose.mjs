import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import OpenAI from 'openai'

const STATE = new URL('./loop-state.json', import.meta.url)
const CAND = new URL('./_iter_cand.json', import.meta.url)
const MAX_EXAMPLES = 3

const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })

function isPolicy(p) {
  return (
    typeof p?.persona === 'string' &&
    Array.isArray(p.progressionRules) && p.progressionRules.every((r) => typeof r === 'string') &&
    Array.isArray(p.exemplars) && p.exemplars.every((i) => typeof i?.tone === 'string' && typeof i?.student === 'string' && typeof i?.tutor === 'string')
  )
}
function summarizeFailures(failures) {
  const byCriterion = new Map()
  for (const f of failures) {
    const e = byCriterion.get(f.id) ?? { count: 0, examples: [] }
    e.count += 1
    if (e.examples.length < MAX_EXAMPLES) e.examples.push(`[${f.persona}/${f.lesson}] ${f.reason}`)
    byCriterion.set(f.id, e)
  }
  return [...byCriterion.entries()].sort((a, b) => b[1].count - a[1].count)
    .map(([id, e]) => `- ${id} (${e.count} fails): ${e.examples.join(' | ')}`).join('\n')
}
function parseLoose(text) {
  return JSON.parse(text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim())
}

const t = Date.now()
if (existsSync(CAND)) { console.log('candidate already exists'); process.exit(0) }
const state = JSON.parse(readFileSync(STATE, 'utf8'))
const system = 'You improve a coding-tutor policy so it teaches better. Keep everything that works and fix the listed failures with minimal, surgical edits. Return STRICT JSON with EXACTLY these keys: persona (string), progressionRules (array of strings), exemplars (array of {tone, student, tutor}). No other keys, no prose.'
const user = [
  'Current policy:',
  JSON.stringify(state.bestPolicy, null, 2),
  'Failing behaviors across many simulated student conversations, grouped by criterion (most frequent first) — fix these:',
  summarizeFailures(state.bestFailures),
  'Return the improved policy JSON now.',
].join('\n\n')

const r = await client.chat.completions.create({
  model: 'anthropic/claude-opus-4.8',
  max_tokens: 4000,
  messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
})
const out = parseLoose(r.choices[0]?.message?.content ?? '{}')
if (!isPolicy(out)) { console.log('INVALID proposal shape'); process.exit(2) }
writeFileSync(CAND, JSON.stringify(out, null, 2))
console.log('OK proposal saved', ((Date.now() - t) / 1000).toFixed(1) + 's', 'outTok', r.usage?.completion_tokens)
