export type LessonEvents = {
  onStepComplete: (stepId: string) => void
  onCheckPassed: (checkId: string) => void
  onLessonComplete: (lessonId: string) => void
  onStreakExtended: (count: number) => void
}

export const NOOP_LESSON_EVENTS: LessonEvents = {
  onStepComplete: () => undefined,
  onCheckPassed: () => undefined,
  onLessonComplete: () => undefined,
  onStreakExtended: () => undefined,
}
