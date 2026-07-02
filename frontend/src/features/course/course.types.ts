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
  levelPct: number
  weeks: readonly WeekView[]
}
