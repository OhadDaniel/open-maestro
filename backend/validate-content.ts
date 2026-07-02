import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bakedLessonSchema } from '../frontend/src/content/baked.types'

const CONTENT_DIR = fileURLToPath(
  new URL('../frontend/public/content', import.meta.url),
)

function findJsonFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true })
    .map((entry) => String(entry))
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(dir, name))
}

function main(): void {
  const files = findJsonFiles(CONTENT_DIR)
  let failures = 0
  for (const file of files) {
    const data: unknown = JSON.parse(readFileSync(file, 'utf8'))
    const result = bakedLessonSchema.safeParse(data)
    if (result.success) {
      console.log(`ok   ${file}`)
    } else {
      failures += 1
      console.error(`FAIL ${file}`)
      console.error(JSON.stringify(result.error.issues, null, 2))
    }
  }
  console.log(`\n${files.length - failures}/${files.length} baked lessons valid`)
  if (failures > 0) {
    process.exit(1)
  }
}

main()
