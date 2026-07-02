import type { BakedLesson } from '../content/baked.types'
import { OfflineTutorProvider } from './offline-provider'
import type { TutorProvider } from './provider'

export function resolveTutorProvider(
  sessionProvider: TutorProvider | null,
  baked: BakedLesson,
  name: string | null,
): TutorProvider {
  return sessionProvider ?? new OfflineTutorProvider(baked, name)
}
