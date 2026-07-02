export const WD_PATH = 'M 640 690 C 700 610 690 560 740 490 C 790 420 800 380 850 310 C 890 250 900 210 930 150'

export const WD_DOTS: readonly (readonly [number, number])[] = [
  [668, 625],
  [742, 487],
  [818, 375],
  [895, 235],
]

export const WD_CAMP: readonly [number, number] = [930, 150]

export const WD_STAR_DECOR: readonly (readonly [number, number])[] = [
  [1020, 95],
  [1150, 85],
  [1085, 150],
]

export const WD_STAR_LAND: readonly [number, number] = [1062, 112]

export const WD_STAR_LINES: readonly (readonly (readonly [number, number])[])[] = [
  [[1020, 95], WD_STAR_LAND, [1150, 85]],
  [WD_STAR_LAND, [1085, 150]],
]

export const WD_TIMING = {
  pathDuration: 1000,
  pathDelay: 150,
  dotStagger: 170,
  dotStart: 350,
  campDelay: 1050,
  starBornDelay: 1650,
} as const

export function weekClearedCopy(weekNumber: number, weekTitle: string) {
  return {
    tag: `Week ${weekNumber} cleared`,
    headline: `That's Week ${weekNumber},`,
    headline2: 'done.',
    sub: `${weekTitle} is behind you — and the route to Week ${weekNumber + 1} just opened.`,
    campWeek: `Week ${weekNumber + 1}`,
    onward: `Onward to Week ${weekNumber + 1}`,
  }
}

export const WD_STAT_PILLS = {
  lessons: '4 lessons',
  time: '58 min with your tutor',
  streak: '13-day streak',
  backToSummit: 'Back to my summit',
} as const

export function memoryLine(why: string, nextWeek: number): string {
  const goal = why.trim().length > 0 ? why.trim() : "you're switching careers"
  return `You told me ${goal} — Week ${nextWeek} is where it starts to show.`
}
