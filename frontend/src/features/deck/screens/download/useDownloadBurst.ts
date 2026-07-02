import { useEffect, type RefObject } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'

type BurstRefs = {
  screen: RefObject<HTMLDivElement | null>
  glow: RefObject<HTMLDivElement | null>
  mark: RefObject<HTMLImageElement | null>
  ring: RefObject<SVGCircleElement | null>
  pulseHost: RefObject<HTMLDivElement | null>
}

const SPARK_COLORS = ['var(--accent)', 'var(--lavender)', 'var(--sunset)']

export function useDownloadBurst(done: boolean, refs: BurstRefs) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!done || reduced) {
      return
    }
    const screen = refs.screen.current
    const glow = refs.glow.current
    const mark = refs.mark.current
    const ring = refs.ring.current
    const pulseHost = refs.pulseHost.current

    if (screen !== null) {
      const flash = document.createElement('div')
      flash.style.cssText =
        'position:absolute;inset:0;pointer-events:none;z-index:3;background:radial-gradient(circle at 50% 40%,rgba(206,245,133,.5),rgba(166,178,247,.18) 40%,transparent 68%);opacity:0'
      screen.appendChild(flash)
      animate(flash, {
        opacity: [0, 0.95, 0],
        duration: 1000,
        ease: EASE.outQuad,
        onComplete: () => flash.remove(),
      })
    }
    if (pulseHost !== null) {
      for (let i = 0; i < 3; i += 1) {
        const pulse = document.createElement('div')
        pulse.style.cssText =
          'position:absolute;inset:0;border-radius:50%;border:2px solid var(--accent);opacity:.6;pointer-events:none'
        pulse.style.animation = `om-pulsering 1350ms var(--e-productive) ${i * 230}ms forwards`
        pulseHost.appendChild(pulse)
        window.setTimeout(() => pulse.remove(), 1800)
      }
      for (let i = 0; i < 20; i += 1) {
        const spark = document.createElement('div')
        const color = SPARK_COLORS[i % 3]
        spark.style.cssText = `position:absolute;left:132px;top:132px;width:6px;height:6px;border-radius:9999px;pointer-events:none;background:${color};box-shadow:0 0 9px ${color}`
        pulseHost.appendChild(spark)
        const angle = (Math.PI * 2 * i) / 20 + (Math.random() * 0.5 - 0.25)
        const dist = 88 + Math.random() * 78
        animate(spark, {
          translateX: Math.cos(angle) * dist,
          translateY: Math.sin(angle) * dist,
          scale: [1, 0],
          opacity: [1, 0],
          duration: 820 + Math.random() * 340,
          ease: EASE.outQuad,
          onComplete: () => spark.remove(),
        })
      }
    }
    if (mark !== null) {
      animate(mark, { scale: [1, 1.2, 1], duration: 900, ease: EASE.outElasticMed })
    }
    if (glow !== null) {
      glow.style.background =
        'radial-gradient(circle,rgba(206,245,133,.62),rgba(166,178,247,.22) 46%,transparent 72%)'
      animate(glow, { scale: [1.08, 1.34, 1.14], opacity: [0.9, 1, 0.86], duration: 960, ease: EASE.outQuad })
    }
    if (ring !== null) {
      animate(ring, { strokeWidth: [6, 11, 7], duration: 820, ease: EASE.outQuad })
    }
  }, [done, reduced, refs])
}
