import type { RawLesson } from '../../frontend/src/content/lesson.types'

export type RawLessonEntry = { slug: string; lesson: RawLesson }

function w1(id: string, title: string, masteryOutcomes: string[]): RawLessonEntry {
  return {
    slug: id,
    lesson: { id: `py101-w1-${id}`, courseId: 'py101', weekId: 'py101-w1', title, masteryOutcomes, tutorInstructions: null },
  }
}

function w2(id: string, title: string, masteryOutcomes: string[]): RawLessonEntry {
  return {
    slug: id,
    lesson: { id: `py101-w2-${id}`, courseId: 'py101', weekId: 'py101-w2', title, masteryOutcomes, tutorInstructions: null },
  }
}

export const WEEK1_RAW: RawLessonEntry[] = [
  w1('unlocking-print-power-ups', 'Unlocking print() power-ups', [
    'Print multiple values using commas',
    'Understand that printing is always on a new line',
    'Print multiple text and numeric values using the + and * operators.',
  ]),
  w1('working-with-text', 'Working with text', [
    'Define a "data type" as a category of data that determines what you can do with it.',
    "Create a string variable by enclosing text in single (') or double (\") quotes.",
    'Combine two strings using the + operator (concatenation).',
    'Predict the output when printing string variables.',
  ]),
  w1('working-with-numbers', 'Working with numbers', [
    'Distinguish between an integer (int, a whole number) and a float (float, a number with a decimal).',
    'Create variables to store integer and float values.',
    'Perform basic arithmetic operations (+, -, *, /) on numeric variables.',
    'Explain why 5 is different from "5".',
  ]),
  w1('modeling-real-world-calculations', 'Modeling real-world calculations', [
    'Translate a two-step word problem into an arithmetic expression and compute the result.',
    'Do arithmetic directly inside print() to produce clear, useful outputs.',
    'Compare two equivalent formulations and choose the clearer one.',
  ]),
]

export const WEEK2_RAW: RawLessonEntry[] = [
  w2('division-modes', 'Division modes: / vs // with quotient and remainder', [
    'Compute and contrast true division (/) and floor division (//) on integers; explain the difference.',
    'Use // and % together to derive quotient and remainder for practical cases (e.g., packing/scheduling).',
  ]),
  w2('modulo-in-practice', 'Modulo in practice: parity, cycles, positions', [
    'Use x % 2 to detect parity and explain why it works.',
    'Apply modulo to cyclic positions (e.g., every Nth item, rotating shifts) to simplify branching.',
  ]),
  w2('rounding-and-money-format', 'Rounding, and money format', [
    'Use round(x, n) to control numeric precision.',
    'Format prices with f"{x:.2f}" as a quick money-format (value vs representation).',
  ]),
  w2('checking-the-facts', 'Checking the facts', [
    "Use type() to check a variable's data type.",
    'Use the str(), int(), and float() functions to convert values between data types.',
  ]),
  w2('getting-input-from-users', 'Talking to your program: getting input from users', [
    'Explain why programs interact with users and when input() is appropriate; collect input with clear prompts.',
    'Convert numeric inputs to the correct type before computing and print a friendly summary.',
  ]),
  w2('meet-the-traceback', 'Python errors: meet the traceback', [
    'Understand why Python provides a traceback and how it helps identify what went wrong.',
    'Identify parts of a traceback and different types of tracebacks.',
  ]),
  w2('functions-i', 'Functions I: why, define, and call', [
    'Understand how functions reduce repetition and improve reuse.',
    'Understand the structure of Python functions.',
    'Define a function with one or two parameters and call it with literals and variables.',
  ]),
  w2('functions-ii', 'Functions II: inside the function', [
    'Understand the structure of a function, including its name, parameters, indentation, and return value.',
    'Call functions with arguments correctly and trace how values are passed from the call site to parameters, verifying the flow using print statements.',
  ]),
  w2('functions-iii', 'Functions III: return vs print and early return', [
    'Differentiate printing vs returning values.',
    'Use return to pass results and apply early returns.',
  ]),
  w2('scope-and-local-variables', 'Scope and local variables', [
    "Understand that variables created inside a function exist only within that function's scope (local).",
    'Explain how local and global scopes differ and identify when each is used.',
    'Demonstrate how data can be passed into functions through parameters instead of relying on global variables.',
  ]),
]

export const ALL_RAW: RawLessonEntry[] = [...WEEK1_RAW, ...WEEK2_RAW]
