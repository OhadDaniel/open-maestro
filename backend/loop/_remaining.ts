import { readFileSync } from 'node:fs'
import { PERSONAS } from './student-sim'
import { ALL_LESSONS } from './lessons'
const c = JSON.parse(readFileSync(new URL('./_resume_ckpt.json', import.meta.url), 'utf8'))
const done = new Set(Object.keys(c.cells || {}))
const lessons = ALL_LESSONS.slice(0, 4)
const remaining: string[] = []
for (const p of PERSONAS) for (const l of lessons) {
  const k = `${p.id}__${l.lesson.id}`
  if (!done.has(k)) remaining.push(k)
}
console.log('remaining', remaining.length)
console.log(remaining.join('\n'))
console.log('attempts', JSON.stringify(c.attempts || {}))
