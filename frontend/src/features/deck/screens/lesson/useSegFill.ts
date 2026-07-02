import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { SEG_FILL_DELAY, SEG_FILL_DURATION, SEG_FILL_TARGET } from './lesson.constants'

export function useSegFill<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (node === null) {
      return
    }
    if (reduced) {
      node.style.width = `${SEG_FILL_TARGET}%`
      return
    }
    node.style.width = '0%'
    animate(node, {
      width: ['0%', `${SEG_FILL_TARGET}%`],
      delay: SEG_FILL_DELAY,
      duration: SEG_FILL_DURATION,
      ease: EASE.inOutQuart,
    })
  }, [reduced])

  return ref
}
