import { useCallback, useMemo, useState } from 'react'
import { SCREEN_FLOW, ZOOM_ORIGINS } from './deck.constants'
import type { ScreenId, Transition, ZoomMode } from './deck.types'

const FADE_ORIGIN = [50, 50] as const

type DeckMove = {
  from: ScreenId | null
  to: ScreenId
}

function resolveTransition(move: DeckMove): Transition {
  if (move.from === null) {
    return { mode: 'fade', origin: FADE_ORIGIN }
  }
  const forward = ZOOM_ORIGINS[`${move.from}>${move.to}`]
  if (forward !== undefined) {
    return { mode: 'in', origin: forward }
  }
  const reverse = ZOOM_ORIGINS[`${move.to}>${move.from}`]
  if (reverse !== undefined) {
    return { mode: 'out', origin: reverse }
  }
  return { mode: 'fade', origin: FADE_ORIGIN }
}

export function useDeck() {
  const [index, setIndex] = useState(0)
  const [previous, setPrevious] = useState<ScreenId | null>(null)

  const current = SCREEN_FLOW[index]

  const transition = useMemo<Transition>(
    () => resolveTransition({ from: previous, to: current }),
    [previous, current],
  )

  const goTo = useCallback(
    (id: ScreenId) => {
      const nextIndex = SCREEN_FLOW.indexOf(id)
      if (nextIndex < 0) {
        return
      }
      setIndex((currentIndex) => {
        if (currentIndex === nextIndex) {
          return currentIndex
        }
        setPrevious(SCREEN_FLOW[currentIndex])
        return nextIndex
      })
    },
    [],
  )

  const step = useCallback((delta: number) => {
    setIndex((currentIndex) => {
      const nextIndex = Math.max(0, Math.min(SCREEN_FLOW.length - 1, currentIndex + delta))
      if (nextIndex === currentIndex) {
        return currentIndex
      }
      setPrevious(SCREEN_FLOW[currentIndex])
      return nextIndex
    })
  }, [])

  const restart = useCallback(() => {
    setPrevious(null)
    setIndex(0)
  }, [])

  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])

  return { current, index, transition, goTo, next, prev, restart }
}

export type DeckMode = ZoomMode
