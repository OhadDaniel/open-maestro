import type { ScreenId } from '../deck/deck.types'

export type NavKey = 'home' | 'learn'

export type NavItem = {
  icon: string
  label: string
  goto?: ScreenId
  key?: NavKey
  locked?: boolean
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { icon: 'home-03', label: 'Home', goto: 'home', key: 'home' },
  { icon: 'book-opened-02', label: 'Learn', goto: 'week', key: 'learn' },
  { icon: 'atom-01-line', label: 'Practice' },
  { icon: 'graduation-hat-02', label: 'Profile' },
  { icon: 'message-chat-circle', label: 'Discussions' },
  { icon: 'help-and-support', label: 'Services' },
]

export const LOCKED_NAV: readonly NavItem[] = [
  { icon: 'route', label: 'Projects', locked: true },
  { icon: 'diamond-01', label: 'Leaderboards', locked: true },
  { icon: 'message-chat-circle', label: 'Community', locked: true },
  { icon: 'graduation-hat-02', label: 'Shop', locked: true },
]

export const APPNAV_WIDTH = 240
