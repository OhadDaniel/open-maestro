import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { SEG_FILL_DELAY, SEG_FILL_DURATION, SEG_FILL_TARGET } from './lesson.constants'

export function useSegFill<T extends HTMLElement>(target: number = SEG_FILL_TARGET) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (node === null) {
      return
    }
    if (reduced) {
      node.style.width = `${target}%`
      return
    }
    node.style.width = '0%'
    animate(node, {
      width: ['0%', `${target}%`],
      delay: SEG_FILL_DELAY,
      duration: SEG_FILL_DURATION,
      ease: EASE.inOutQuart,
    })
  }, [reduced, target])

  return ref
}
