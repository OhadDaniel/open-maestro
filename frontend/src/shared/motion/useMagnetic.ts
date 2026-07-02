import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

const MAX_X = 12
const MAX_Y = 8
const LIFT = 2

export function useMagnetic<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (node === null || !enabled || reduced) {
      return
    }
    node.style.transition = 'transform .18s var(--e-productive), box-shadow .2s var(--e-productive)'
    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      const dx = ((event.clientX - rect.left) / rect.width - 0.5) * (MAX_X * 2)
      const dy = ((event.clientY - rect.top) / rect.height - 0.5) * (MAX_Y * 2)
      node.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - LIFT).toFixed(1)}px)`
    }
    const onLeave = () => {
      node.style.transform = 'translate(0, 0)'
    }
    node.addEventListener('mousemove', onMove)
    node.addEventListener('mouseleave', onLeave)
    return () => {
      node.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, reduced])

  return ref
}
