import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { TYPEWRITER_CPS, TYPEWRITER_START } from './lessondone.constants'

export function useTypewriter(full: string): string {
  const reduced = useReducedMotion()
  const [text, setText] = useState(reduced ? full : '')

  useEffect(() => {
    if (reduced) {
      setText(full)
      return
    }
    setText('')
    let index = 0
    let interval = 0
    const startTimer = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1
        setText(full.slice(0, index))
        if (index >= full.length) {
          window.clearInterval(interval)
        }
      }, 1000 / TYPEWRITER_CPS)
    }, TYPEWRITER_START)
    return () => {
      window.clearTimeout(startTimer)
      window.clearInterval(interval)
    }
  }, [full, reduced])

  return text
}
