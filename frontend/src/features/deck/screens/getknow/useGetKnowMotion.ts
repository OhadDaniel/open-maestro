import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'

export function useGetKnowMotion<T extends HTMLElement>(step: number) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const panel = ref.current
    if (panel === null) {
      return
    }
    if (reduced) {
      panel.style.opacity = '1'
      panel.style.transform = 'none'
      return
    }
    animate(panel, { opacity: [0, 1], translateY: [26, 0], duration: 520, ease: EASE.outCubic })
    const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-gk-item]'))
    if (items.length > 0) {
      animate(items, {
        opacity: [0, 1],
        translateY: [14, 0],
        delay: stagger(65, { start: 140 }),
        duration: 440,
        ease: EASE.outCubic,
      })
    }
  }, [step, reduced])

  return ref
}
