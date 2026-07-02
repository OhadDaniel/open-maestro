import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'

export function useWaypointPulse<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const host = ref.current
    if (host === null) {
      return
    }
    const dots = Array.from(host.querySelectorAll<HTMLElement>('[data-waypoint]'))
    if (dots.length === 0) {
      return
    }
    if (reduced) {
      for (const dot of dots) {
        dot.style.opacity = '.75'
      }
      return undefined
    }
    const animation = animate(dots, {
      opacity: [
        { to: 0.12, duration: 0 },
        { to: 1, duration: 300 },
        { to: 0.18, duration: 760 },
      ],
      scale: [
        { to: 0.65, duration: 0 },
        { to: 1.3, duration: 300 },
        { to: 0.9, duration: 760 },
      ],
      delay: stagger(240),
      loop: true,
      ease: EASE.inOutSine,
    })
    return () => {
      animation.pause()
    }
  }, [reduced])

  return ref
}
