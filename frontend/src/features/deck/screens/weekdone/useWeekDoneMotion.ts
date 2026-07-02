import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { starBorn } from './useStarBorn'
import { WD_TIMING } from './weekdone.constants'

const PATH_GLOW = 'drop-shadow(0 0 8px rgba(206,245,133,.55))'

export function useWeekDoneMotion<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (root === null) {
      return
    }
    const path = root.querySelector<SVGPathElement>('[data-wd-path]')
    const cores = Array.from(root.querySelectorAll<HTMLElement>('[data-wd-core]'))
    const camp = root.querySelector<HTMLElement>('[data-wd-campwrap]')
    const sky = root.querySelector<HTMLElement>('[data-ws-sky]')

    if (reduced) {
      if (path !== null) {
        path.style.strokeDashoffset = '0'
        path.style.filter = PATH_GLOW
      }
      for (const core of cores) {
        core.style.opacity = '1'
      }
      if (camp !== null) {
        camp.style.opacity = '1'
      }
      return
    }

    if (path !== null) {
      const length = path.getTotalLength()
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(length)
      path.style.filter = 'none'
      animate(path, {
        strokeDashoffset: [length, 0],
        duration: WD_TIMING.pathDuration,
        delay: WD_TIMING.pathDelay,
        ease: EASE.inOutQuad,
        onComplete: () => {
          path.style.filter = PATH_GLOW
        },
      })
    }
    for (const core of cores) {
      core.style.opacity = '0'
    }
    animate(cores, { opacity: [0, 1], scale: [0.3, 1], duration: 380, delay: stagger(WD_TIMING.dotStagger, { start: WD_TIMING.dotStart }), ease: EASE.outBack })
    if (camp !== null) {
      camp.style.opacity = '0'
      animate(camp, { opacity: [0, 1], scale: [0.4, 1], duration: 600, delay: WD_TIMING.campDelay, ease: EASE.outElasticSoft })
    }
    const starTimer = window.setTimeout(() => {
      if (sky !== null) {
        starBorn(sky)
      }
    }, WD_TIMING.starBornDelay)
    return () => {
      window.clearTimeout(starTimer)
      if (sky !== null) {
        sky.innerHTML = ''
      }
    }
  }, [reduced])

  return ref
}
