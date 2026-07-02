import type { ScreenId, ZoomOrigin } from './deck.types'

export const SCREEN_FLOW: ScreenId[] = [
  'welcome',
  'name',
  'degree',
  'download',
  'celebrate',
  'getknow',
  'home',
  'week',
  'lesson',
  'code',
  'lessondone',
  'weekdone',
]

export const CANVAS_WIDTH = 1240
export const CANVAS_HEIGHT = 800

export const ZOOM_ORIGINS: Partial<Record<`${ScreenId}>${ScreenId}`, ZoomOrigin>> = {
  'home>week': [63, 54],
  'week>lesson': [46, 64],
}

export const ZOOM_TIMING = {
  outgoingIn: 520,
  incomingIn: 480,
  incomingInDelay: 110,
  outgoingOut: 340,
  incomingOut: 560,
  fadeOut: 300,
  fadeInRise: 520,
} as const
