import { readFileSync } from 'node:fs'
import { runConversation } from './conversation'
import { judgeConversation } from './judge-conversation'
import { PERSONAS } from './student-sim'
import { ALL_LESSONS } from './lessons'
const cand = JSON.parse(readFileSync(new URL('./_resume_ckpt.json', import.meta.url), 'utf8')).candidate
const persona = PERSONAS.find((p) => p.id === 'skeptical-why')!
const lesson = ALL_LESSONS.find((l) => l.lesson.id === 'py101-w2-checking-the-facts')!
const t0 = Date.now()
const turns = await runConversation(persona, lesson, cand)
const tc = Date.now()
const res = await judgeConversation(turns)
console.log('turns', turns.length, 'conv_ms', tc - t0, 'judge_ms', Date.now() - tc, 'total_ms', Date.now() - t0)
