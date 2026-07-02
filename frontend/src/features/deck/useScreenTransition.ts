import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../shared/motion/easing'
import { useReducedMotion } from '../../shared/motion/useReducedMotion'
import { ZOOM_TIMING } from './deck.constants'
import type { Transition } from './deck.types'

export function useScreenTransition(transition: Transition, key: string) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (node === null) {
      return
    }
    if (reduced) {
      node.style.opacity = '1'
      node.style.transform = 'none'
      return
    }
    node.style.transformOrigin = `${transition.origin[0]}% ${transition.origin[1]}%`
    if (transition.mode === 'in') {
      node.style.transformOrigin = '50% 50%'
      animate(node, {
        opacity: [0, 1],
        scale: [0.94, 1],
        delay: ZOOM_TIMING.incomingInDelay,
        duration: ZOOM_TIMING.incomingIn,
        ease: EASE.outCubic,
      })
    } else if (transition.mode === 'out') {
      animate(node, {
        opacity: [0, 1],
        scale: [1.45, 1],
        duration: ZOOM_TIMING.incomingOut,
        ease: EASE.outCubic,
      })
    } else {
      node.style.transformOrigin = '50% 50%'
      animate(node, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: ZOOM_TIMING.fadeInRise,
        ease: EASE.outCubic,
      })
    }
  }, [key, reduced, transition])

  return ref
}
