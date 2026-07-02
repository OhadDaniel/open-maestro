import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { PANE_SLIDE_DURATION } from './code.constants'

export function usePaneSlide<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (node === null) {
      return
    }
    if (reduced) {
      node.style.transform = 'none'
      return
    }
    animate(node, {
      translateX: ['101%', '0%'],
      duration: PANE_SLIDE_DURATION,
      ease: EASE.outCubic,
    })
  }, [reduced])

  return ref
}
