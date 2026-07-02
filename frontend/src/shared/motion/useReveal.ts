import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { DURATION, EASE, REVEAL_STAGGER, REVEAL_START } from './easing'
import { useReducedMotion } from './useReducedMotion'

const REVEAL_SELECTOR = '[data-reveal]'

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (root === null) {
      return
    }
    const items = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
    if (items.length === 0) {
      return
    }
    if (reduced) {
      for (const item of items) {
        item.style.opacity = '1'
        item.style.transform = 'none'
      }
      return
    }
    animate(items, {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(REVEAL_STAGGER, { start: REVEAL_START }),
      duration: DURATION.reveal,
      ease: EASE.outCubic,
    })
  }, [reduced])

  return ref
}
