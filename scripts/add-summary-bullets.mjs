import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(__dir, '../frontend/public/content/py101')

const MANUAL_BULLETS = {
  'writing-your-first-program.json': [
    'You can now navigate the Maestro Code Editor to write and run Python code.',
    'You can now write and execute a simple Python script using the print() function.',
    'You understand how to use print() to display output in Python.',
  ],
  'welcome-to-py101.json': [
    'You can now describe how PY101 is structured across its four units.',
    'You can now explain how the final grade is built from reviews, discussions, and bonus points.',
    'You understand what to expect from the course and how to succeed from day one.',
  ],
}

function outcomeToYouCanNow(outcome) {
  const clean = outcome.replace(/\.$/, '').trim()
  if (/^introduce the /i.test(clean)) {
    const rest = clean.slice('Introduce the '.length)
    return `You can now navigate the ${rest.charAt(0).toLowerCase()}${rest.slice(1)}.`
  }
  const lower = clean.charAt(0).toLowerCase() + clean.slice(1)
  return `You can now ${lower}.`
}

const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'))

for (const file of files) {
  const path = resolve(contentDir, file)
  const data = JSON.parse(readFileSync(path, 'utf8'))

  if (data.summaryBullets) {
    console.log(`already has bullets: ${file}`)
    continue
  }

  let bullets
  if (MANUAL_BULLETS[file]) {
    bullets = MANUAL_BULLETS[file]
  } else {
    bullets = data.lesson.masteryOutcomes.slice(0, 5).map(outcomeToYouCanNow)
    if (bullets.length < 3) {
      const concept = data.concept.split('—')[0].trim()
      const lower = concept.charAt(0).toLowerCase() + concept.slice(1)
      bullets.push(`You understand ${lower}.`)
    }
  }

  const { celebration, ...rest } = data
  const updated = { ...rest, celebration, summaryBullets: bullets.slice(0, 5) }
  writeFileSync(path, JSON.stringify(updated, null, 2) + '\n')
  console.log(`updated ${file}: ${bullets.length} bullets`)
  bullets.forEach((b) => console.log(`  - ${b}`))
}
