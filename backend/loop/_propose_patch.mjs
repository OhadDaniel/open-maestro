import OpenAI from 'openai'
import { readFileSync, writeFileSync, renameSync } from 'node:fs'
const client = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
const RESEARCHER = 'anthropic/claude-opus-4.8'
const STATE_PATH = new URL('./loop-state.json', import.meta.url)
const CAND = '/sessions/wizardly-charming-franklin/mnt/outputs/iter3/_iter_cand.json'

function isPolicy(p){return p&&typeof p.persona==='string'&&Array.isArray(p.progressionRules)&&p.progressionRules.every(r=>typeof r==='string')&&Array.isArray(p.exemplars)&&p.exemplars.every(i=>i&&typeof i.tone==='string'&&typeof i.student==='string'&&typeof i.tutor==='string')}
function parseLoose(t){const c=t.trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();return JSON.parse(c)}
function summarizeFailures(fs){const by=new Map();for(const f of fs){const e=by.get(f.id)??{count:0,examples:[]};e.count+=1;if(e.examples.length<3)e.examples.push(`[${f.persona}/${f.lesson}] ${f.reason}`);by.set(f.id,e)}return[...by.entries()].sort((a,b)=>b[1].count-a[1].count).map(([id,e])=>`- ${id} (${e.count} fails): ${e.examples.join(' | ')}`).join('\n')}

const state=JSON.parse(readFileSync(STATE_PATH,'utf8'))
const system='You improve a coding-tutor policy so it teaches better with minimal, surgical edits that fix the listed failures. Return STRICT MINIFIED JSON containing ONLY the top-level keys you are CHANGING. Allowed keys: persona (string), progressionRules (array of strings), exemplars (array of {tone,student,tutor}). OMIT any key you leave unchanged. Prefer fixing failures by editing progressionRules and persona; include exemplars ONLY if essential, and if so return the COMPLETE new exemplars array. No prose, JSON object only.'
const user=['Current policy:',JSON.stringify(state.bestPolicy,null,2),'Failing behaviors across many simulated student conversations, grouped by criterion (most frequent first) — fix these:',summarizeFailures(state.bestFailures),'Return ONLY the changed top-level keys as one minified JSON object now.'].join('\n\n')

const r=await client.chat.completions.create({model:RESEARCHER,max_tokens:4000,messages:[{role:'system',content:system},{role:'user',content:user}]})
const txt=r.choices?.[0]?.message?.content??''
let patch
try{patch=parseLoose(txt)}catch(e){console.log('PARSE_FAIL len='+txt.length+' head='+JSON.stringify(txt.slice(0,120)));process.exit(2)}
const allowed=new Set(['persona','progressionRules','exemplars'])
const keys=Object.keys(patch).filter(k=>allowed.has(k))
if(keys.length===0){console.log('EMPTY_PATCH keys='+JSON.stringify(Object.keys(patch)));process.exit(3)}
const candidate={...state.bestPolicy};for(const k of keys)candidate[k]=patch[k]
if(!isPolicy(candidate)){console.log('INVALID_MERGE');process.exit(4)}
const changed=JSON.stringify(candidate)!==JSON.stringify(state.bestPolicy)
if(!changed){console.log('NOOP_PATCH');process.exit(5)}
writeFileSync(CAND+'.tmp',JSON.stringify(candidate,null,2));renameSync(CAND+'.tmp',CAND)
console.log('DONE patchKeys='+JSON.stringify(keys)+' candLen='+JSON.stringify(candidate).length)
