import { useEffect, type RefObject } from 'react'
import { animate } from 'animejs'
import { EASE } from './easing'
import { useReducedMotion } from './useReducedMotion'

const SPINDRIFT_COUNT = 16

function alpenglow(screen: HTMLElement) {
  const sweep = document.createElement('div')
  sweep.style.cssText =
    'position:absolute;inset:0;pointer-events:none;z-index:14;opacity:0;background:linear-gradient(105deg,transparent 26%,rgba(234,173,94,.13) 42%,rgba(236,235,228,.2) 50%,rgba(234,173,94,.12) 58%,transparent 74%);transform:translateX(-60%)'
  screen.appendChild(sweep)
  animate(sweep, {
    translateX: ['-60%', '60%'],
    opacity: [
      { to: 1, duration: 250 },
      { to: 1, duration: 700 },
      { to: 0, duration: 450 },
    ],
    duration: 1500,
    ease: EASE.inOutSine,
    onComplete: () => sweep.remove(),
  })
  const bloom = document.createElement('div')
  bloom.style.cssText =
    'position:absolute;inset:0;pointer-events:none;z-index:13;opacity:0;background:radial-gradient(90% 70% at 50% 30%,rgba(236,235,228,.15),transparent 62%)'
  screen.appendChild(bloom)
  animate(bloom, { opacity: [0, 1, 0], duration: 2000, ease: EASE.inOutQuad, onComplete: () => bloom.remove() })
}

function spindrift(screen: HTMLElement, count: number) {
  for (let i = 0; i < count; i += 1) {
    const streak = document.createElement('span')
    const top = 40 + Math.random() * 620
    const len = 18 + Math.random() * 26
    const opacity = 0.3 + Math.random() * 0.5
    streak.style.cssText = `position:absolute;pointer-events:none;z-index:14;left:104%;top:${top}px;width:${len}px;height:2px;border-radius:9999px;background:rgba(236,235,228,${opacity})`
    screen.appendChild(streak)
    animate(streak, {
      translateX: [0, -(1500 + Math.random() * 500)],
      translateY: [0, 60 + Math.random() * 90],
      rotate: -6,
      opacity: [
        { to: opacity, duration: 100 },
        { to: 0, duration: 600, delay: 500 },
      ],
      duration: 1100 + Math.random() * 800,
      delay: Math.random() * 1500,
      ease: EASE.inQuad,
      onComplete: () => streak.remove(),
    })
  }
}

export function useCelebration(ref: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion()
  useEffect(() => {
    const screen = ref.current
    if (screen === null || reduced) {
      return
    }
    alpenglow(screen)
    spindrift(screen, SPINDRIFT_COUNT)
  }, [ref, reduced])
}

export function useMedallionPop(ref: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion()
  useEffect(() => {
    const node = ref.current
    if (node === null || reduced) {
      return
    }
    animate(node, { scale: [0.68, 1], opacity: [0, 1], duration: 760, ease: EASE.outElasticWide })
  }, [ref, reduced])
}
