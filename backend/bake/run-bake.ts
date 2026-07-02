import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { RawLesson } from '../../frontend/src/content/lesson.types'
import { bakedLessonSchema } from '../../frontend/src/content/baked.types'
import { completeJson } from '../eval/openai-client'
import { BAKE_SYSTEM_PROMPT, buildBakeUserPrompt } from './bake-prompt'
import { ALL_RAW } from './raw-lessons'

const BAKER_MODEL = 'anthropic/claude-fable-5'
const FORCE = process.argv.includes('--force')
const CONTENT_DIR = fileURLToPath(
  new URL('../../frontend/public/content/py101/', import.meta.url),
)
const EXAMPLE = readFileSync(`${CONTENT_DIR}writing-your-first-program.json`, 'utf8')

async function bakeOne(slug: string, lesson: RawLesson): Promise<boolean> {
  const target = `${CONTENT_DIR}${slug}.json`
  if (!FORCE && existsSync(target)) {
    console.log(`skip ${slug} (already baked)`)
    return true
  }
  const user = buildBakeUserPrompt(lesson, EXAMPLE)
  let candidate = await completeJson(BAKER_MODEL, BAKE_SYSTEM_PROMPT, user)
  let parsed = bakedLessonSchema.safeParse(candidate)

  if (!parsed.success) {
    const repair = [
      user,
      'Your previous JSON failed validation with these issues:',
      JSON.stringify(parsed.error.issues, null, 2),
      'Previous attempt:',
      JSON.stringify(candidate),
      'Return corrected BakedLesson JSON only.',
    ].join('\n\n')
    candidate = await completeJson(BAKER_MODEL, BAKE_SYSTEM_PROMPT, repair)
    parsed = bakedLessonSchema.safeParse(candidate)
  }

  if (!parsed.success) {
    console.error(`FAIL ${slug}: ${JSON.stringify(parsed.error.issues.slice(0, 3))}`)
    return false
  }
  writeFileSync(target, JSON.stringify(parsed.data, null, 2))
  console.log(`ok   ${slug}`)
  return true
}

async function main(): Promise<void> {
  const outcomes = await Promise.all(ALL_RAW.map((entry) => bakeOne(entry.slug, entry.lesson)))
  const ok = outcomes.filter(Boolean).length
  console.log(`\n${ok}/${outcomes.length} lessons ready`)
  if (ok < outcomes.length) {
    process.exit(1)
  }
}

main().catch((error: unknown) => {
  console.error('bake failed:', error)
  process.exit(1)
})
