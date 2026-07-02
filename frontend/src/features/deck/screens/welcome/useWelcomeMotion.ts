import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { DURATION, EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'

const MOTE_COUNT = 9

export function useWelcomeMotion<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (root === null) {
      return
    }
    const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-wline]'))
    const moteHost = root.querySelector<HTMLElement>('[data-motes]')

    if (reduced) {
      for (const line of lines) {
        line.style.transform = 'none'
      }
      return
    }

    if (lines.length > 0) {
      for (const line of lines) {
        line.style.transform = 'translateY(115%)'
      }
      animate(lines, {
        translateY: ['115%', '0%'],
        delay: stagger(130, { start: 220 }),
        duration: DURATION.lineMask,
        ease: EASE.outQuint,
      })
    }

    if (moteHost !== null) {
      moteHost.innerHTML = ''
      for (let i = 0; i < MOTE_COUNT; i += 1) {
        const mote = document.createElement('span')
        const size = 2 + Math.random() * 2
        const alpha = (0.12 + Math.random() * 0.2).toFixed(2)
        mote.style.cssText = `position:absolute;border-radius:9999px;background:rgba(236,235,228,${alpha});width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${30 + Math.random() * 68}%;opacity:0`
        moteHost.appendChild(mote)
        animate(mote, {
          translateY: [0, -(90 + Math.random() * 140)],
          translateX: [0, (Math.random() * 2 - 1) * 50],
          opacity: [
            { to: 0.85, duration: 2200 },
            { to: 0, duration: 2600 },
          ],
          duration: 7000 + Math.random() * 5000,
          delay: Math.random() * 3800,
          loop: true,
          ease: EASE.linear,
        })
      }
    }
    return () => {
      if (moteHost !== null) {
        moteHost.innerHTML = ''
      }
    }
  }, [reduced])

  return ref
}
