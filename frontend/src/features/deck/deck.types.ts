export type ScreenId =
  | 'welcome'
  | 'name'
  | 'degree'
  | 'download'
  | 'celebrate'
  | 'getknow'
  | 'home'
  | 'week'
  | 'lesson'
  | 'code'
  | 'lessondone'
  | 'weekdone'

export type ZoomMode = 'in' | 'out' | 'fade'

export type ZoomOrigin = readonly [number, number]

export type Transition = {
  mode: ZoomMode
  origin: ZoomOrigin
}
