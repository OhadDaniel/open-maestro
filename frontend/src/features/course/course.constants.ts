import { AI_ENGINEERING_CATALOG } from '../../content/samples/py101-catalog'
import type { CourseNode } from '../../content/catalog.types'

export const ACTIVE_COURSE: CourseNode = AI_ENGINEERING_CATALOG.courses[0]

export const WEEK_LESSON_COUNT = 4

export const REAL_WEEK_COUNT = 2

export const LESSON_STEPS = 5

export const WEEK_TITLES: readonly string[] = [
  'Printing & comments',
  'Variables & types',
  'Functions & input',
  'Conditionals',
  'Loops',
]

export const WEEK_LESSON_TITLES: readonly (readonly string[])[] = [
  ['The print function', 'Writing comments', 'Running your code', 'Print power-ups'],
  ['Numbers & strings', 'Naming variables', 'Working with text', 'Working with numbers'],
  ['Defining functions', 'Parameters & arguments', 'Return values', 'Input & output'],
]

export const RESUME_LESSON_SLUG = 'getting-input-from-users'

export const RESUME_LESSON_TITLE = 'Input & output'

export const COURSE_LEVEL_COUNT = 5
