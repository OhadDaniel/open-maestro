import { useEffect, type RefObject } from 'react'
import { animate } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { CHECK_POP_DURATION, SPARK_COUNT, SPARK_DELAY } from './lessondone.constants'

const SPARK_COLORS = ['var(--accent)', 'var(--lavender)', 'var(--sunset)'] as const
const SPARK_RADIUS = 46

export function useCheckPop(burst: RefObject<HTMLElement | null>, check: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const checkNode = check.current
    const burstNode = burst.current
    if (checkNode === null || burstNode === null || reduced) {
      return
    }
    animate(checkNode, { scale: [0.3, 1], opacity: [0, 1], duration: CHECK_POP_DURATION, ease: EASE.outElasticSoft })
    const sparks: HTMLElement[] = []
    for (let i = 0; i < SPARK_COUNT; i += 1) {
      const angle = (i / SPARK_COUNT) * Math.PI * 2
      const spark = document.createElement('span')
      spark.style.cssText = `position:absolute;left:50%;top:50%;width:5px;height:5px;border-radius:9999px;background:${SPARK_COLORS[i % SPARK_COLORS.length]};opacity:0`
      burstNode.appendChild(spark)
      sparks.push(spark)
      animate(spark, {
        translateX: [0, Math.cos(angle) * SPARK_RADIUS],
        translateY: [0, Math.sin(angle) * SPARK_RADIUS],
        opacity: [{ to: 1, duration: 120 }, { to: 0, duration: 380 }],
        scale: [0.6, 1],
        delay: SPARK_DELAY,
        duration: 500,
        ease: EASE.outCubic,
        onComplete: () => spark.remove(),
      })
    }
  }, [burst, check, reduced])
}
