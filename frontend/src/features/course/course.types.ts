export type WeekStatus = 'done' | 'current' | 'locked'

export type WeekView = {
  index: number
  title: string
  lessonTitles: readonly string[]
  status: WeekStatus
  lessonsDone: number
}

export type CoursePosition = {
  currentWeekIndex: number
  currentLessonIndex: number
  currentWeekId: string
  currentLessonSlug: string
  currentLessonTitle: string
  lessonsInWeek: number
  isLastLessonOfWeek: boolean
  allWeeksCleared: boolean
  levelPct: number
  weeks: readonly WeekView[]
}
