import { HEAD_ENTRIES } from './bake-week1-head'
import { bakeOne } from './run-bake'

async function main(): Promise<void> {
  for (const [index, entry] of HEAD_ENTRIES.entries()) {
    const previousLesson = index === 0 ? null : HEAD_ENTRIES[index - 1].lesson
    const ok = await bakeOne(entry.slug, entry.lesson, {
      previousLesson,
      isWeekOne: true,
    })
    if (!ok) {
      process.exit(1)
    }
  }
  console.log('week-1 head ready')
}

main().catch((error: unknown) => {
  console.error('bake failed:', error)
  process.exit(1)
})
