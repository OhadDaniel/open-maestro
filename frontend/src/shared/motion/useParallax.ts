import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

const LERP = 0.09
const IMG_X = -13
const IMG_Y = -9
const ORB_X = 8
const ORB_Y = 6

export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const screen = ref.current
    if (screen === null || reduced) {
      return
    }
    const img = screen.querySelector<HTMLElement>('[data-plx-img]')
    const orbs = Array.from(screen.querySelectorAll<HTMLElement>('[data-plx-orb]'))
    if (img === null && orbs.length === 0) {
      return
    }
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let raf = 0

    const tick = () => {
      currentX += (targetX - currentX) * LERP
      currentY += (targetY - currentY) * LERP
      if (img !== null) {
        img.style.transform = `translate(${currentX * IMG_X}px, ${currentY * IMG_Y}px) scale(1.06)`
      }
      for (const orb of orbs) {
        orb.style.transform = `translate(${currentX * ORB_X}px, ${currentY * ORB_Y}px)`
      }
      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }
    const kick = () => {
      if (raf === 0) {
        raf = requestAnimationFrame(tick)
      }
    }
    const onMove = (event: MouseEvent) => {
      const rect = screen.getBoundingClientRect()
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      kick()
    }
    const onLeave = () => {
      targetX = 0
      targetY = 0
      kick()
    }
    screen.addEventListener('mousemove', onMove)
    screen.addEventListener('mouseleave', onLeave)
    return () => {
      screen.removeEventListener('mousemove', onMove)
      screen.removeEventListener('mouseleave', onLeave)
      if (raf !== 0) {
        cancelAnimationFrame(raf)
      }
    }
  }, [reduced])

  return ref
}
