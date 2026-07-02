import { useEffect, useState } from 'react'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './deck.constants'

const MARGIN_X = 56
const MARGIN_Y = 56
const MIN_SCALE = 0.2

export function useFit(): number {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const fit = Math.min(
        (width - MARGIN_X) / CANVAS_WIDTH,
        (height - MARGIN_Y) / CANVAS_HEIGHT,
      )
      setScale(Math.max(MIN_SCALE, fit))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return scale
}
