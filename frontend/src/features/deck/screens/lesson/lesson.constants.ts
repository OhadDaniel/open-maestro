export const CODE_LINES: readonly (readonly { readonly text: string; readonly color?: string }[])[] = [
  [
    { text: 'name ' },
    { text: '=', color: 'var(--fg-2)' },
    { text: ' ' },
    { text: 'input', color: 'var(--evergreen)' },
    { text: '(' },
    { text: '"What\'s your name? "', color: 'var(--sunset)' },
    { text: ')' },
  ],
  [
    { text: 'print', color: 'var(--evergreen)' },
    { text: '(' },
    { text: '"Hello, "', color: 'var(--sunset)' },
    { text: ' ' },
    { text: '+', color: 'var(--fg-2)' },
    { text: ' name ' },
    { text: '+', color: 'var(--fg-2)' },
    { text: ' ' },
    { text: '"!"', color: 'var(--sunset)' },
    { text: ')' },
  ],
]

export const SEG_FILL_TARGET = 55
export const SEG_FILL_DURATION = 900
export const SEG_FILL_DELAY = 420
export const TYPING_DELAY = 1750
export const USER_READY = 'I&#39;m ready'
