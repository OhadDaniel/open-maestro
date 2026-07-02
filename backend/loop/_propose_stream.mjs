import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import OpenAI from 'openai'

const STATE = new URL('./loop-state.json', import.meta.url)
const CAND = new URL('./_iter_cand.json', import.meta.url)
const PARTIAL = new URL('./_iter_cand_partial.txt', import.meta.url)
const MAX_EXAMPLES = 3
const DEADLINE_MS = 38000

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
function tryFinish(acc) {
  let out
  try { out = parseLoose(acc) } catch { return false }
  if (!isPolicy(out)) return false
  writeFileSync(CAND, JSON.stringify(out, null, 2))
  rmSync(PARTIAL, { force: true })
  return true
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

let acc = existsSync(PARTIAL) ? readFileSync(PARTIAL, 'utf8') : ''
if (acc && tryFinish(acc)) { console.log('OK proposal already complete from partial'); process.exit(0) }

const messages = [{ role: 'system', content: system }, { role: 'user', content: user }]
if (acc.length > 0) {
  messages.push({
    role: 'user',
    content: `You previously began producing the JSON but were cut off. Here is EXACTLY the text you produced so far:\n\n${acc}\n\nContinue from exactly where that stops. Output ONLY the remaining characters that come after it, with no repetition of any earlier characters, no preface, and no code fences.`,
  })
}

const stream = await client.chat.completions.create({
  model: 'anthropic/claude-opus-4.8',
  max_tokens: 4000,
  stream: true,
  messages,
})
let cut = false
for await (const chunk of stream) {
  const d = chunk.choices?.[0]?.delta?.content
  if (d) acc += d
  if (Date.now() - t > DEADLINE_MS) { cut = true; try { stream.controller?.abort() } catch {} break }
}
writeFileSync(PARTIAL, acc)
if (!cut && tryFinish(acc)) {
  console.log('OK proposal saved', ((Date.now() - t) / 1000).toFixed(1) + 's', 'chars', acc.length)
  process.exit(0)
}
console.log(`PARTIAL chars=${acc.length} cut=${cut} elapsed=${((Date.now() - t) / 1000).toFixed(1)}s — run again to continue`)
