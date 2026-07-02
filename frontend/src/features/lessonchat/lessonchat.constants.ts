export const LESSON_SLUG = 'getting-input-from-users'

export const COURSE_ID = 'py101'

export const STARTER_CODE = 'name = input("What\'s your name? ")\nprint("Hello, " + name + "!")\n'

export const LESSON_CHAT_COPY = {
  lessonTitle: 'Input & output',
  lessonMeta: 'PY101 · Lesson 4',
  composerPlaceholder: 'Message Maestro',
  openCodePanel: 'Open the code panel',
  explainInput: 'Explain input()',
  showExample: 'Show an example',
  finishLesson: 'Finish lesson',
  fileName: 'main.py',
  run: 'Run',
  running: 'Running…',
  starting: 'Starting Python…',
} as const

export const TUTOR_INTRO =
  "The input() function pauses your program and waits for the user to type. Whatever they type comes back as a string."

export const TUTOR_TRY_PROMPT =
  "Want to try it yourself? I'll open the code panel and you can run it — then we'll make it your own."

export const FIRST_BUBBLE_FALLBACK =
  'Ready for input and output? Last time we covered print() and comments.'

export const RUN_REPLY =
  "Nice — it greeted you by name. That's your first interactive program. Ready to make it your own?"

export function memoryCallback(name: string): string {
  return `Welcome back, ${name}. Last time we covered print() and comments. Ready for input and output?`
}
