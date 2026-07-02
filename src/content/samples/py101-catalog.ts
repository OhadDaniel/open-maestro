import type { DegreeCatalog } from '../catalog.types'

export const AI_ENGINEERING_CATALOG: DegreeCatalog = {
  id: 'ai-engineering',
  title: 'AI Engineering',
  courses: [
    {
      id: 'py101',
      code: 'PY101',
      title: 'Introduction to Python programming',
      weeks: [
        {
          id: 'py101-w1',
          title: 'Writing your first program',
          lessons: [
            { id: 'py101-w1-welcome', title: 'Welcome to PY101!' },
            {
              id: 'py101-w1-writing-your-first-program',
              title: 'Writing your first program',
            },
            { id: 'py101-w1-variables', title: 'Storing values with variables' },
            { id: 'py101-w1-data-types', title: 'Numbers, strings, and booleans' },
          ],
        },
        {
          id: 'py101-w2',
          title: 'Core foundations',
          lessons: [
            { id: 'py101-w2-operators', title: 'Operators and expressions' },
            { id: 'py101-w2-input', title: 'Reading input from the user' },
          ],
        },
        {
          id: 'py101-w3',
          title: 'Decisions and loops',
          lessons: [
            { id: 'py101-w3-conditionals', title: 'Making decisions with if' },
            { id: 'py101-w3-loops', title: 'Repeating work with loops' },
          ],
        },
      ],
    },
  ],
}
