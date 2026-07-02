import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { useReducedMotion } from '../../../../shared/motion/useReducedMotion'
import { SKY_CONSTELLATIONS, SKY_STARS } from './home.constants'

const SVG_NS = 'http://www.w3.org/2000/svg'

function buildSky(host: HTMLElement, completedConstellations: number, reduced: boolean) {
  host.innerHTML = ''
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 1000 760')
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%'
  const lines = SKY_CONSTELLATIONS.slice(0, completedConstellations).map((indices) => {
    const line = document.createElementNS(SVG_NS, 'polyline')
    line.setAttribute('points', indices.map((i) => `${SKY_STARS[i].x},${SKY_STARS[i].y}`).join(' '))
    line.setAttribute('fill', 'none')
    line.setAttribute('stroke', 'rgba(166,178,247,.3)')
    line.setAttribute('stroke-width', '1')
    svg.appendChild(line)
    return line
  })
  host.appendChild(svg)
  const stars = SKY_STARS.map((star) => {
    const el = document.createElement('span')
    el.style.cssText = 'position:absolute;width:5px;height:5px;border-radius:9999px;background:#E9EBFF;box-shadow:0 0 9px rgba(166,178,247,.95);pointer-events:auto;transform:translate(-50%,-50%)'
    el.style.left = `${star.x / 10}%`
    el.style.top = `${(star.y / 760) * 100}%`
    const label = document.createElement('span')
    label.style.cssText = 'position:absolute;left:12px;top:-11px;display:none;white-space:nowrap;padding:4px 10px;border-radius:9999px;background:rgba(14,14,13,.92);border:1px solid var(--border);color:var(--fg);font-size:11.5px;font-weight:600'
    label.innerHTML = `${star.concept} <span style="color:var(--fg-3);font-weight:500">· ${star.week}</span>`
    el.appendChild(label)
    el.addEventListener('mouseenter', () => {
      label.style.display = 'block'
      el.style.transform = 'translate(-50%,-50%) scale(2)'
    })
    el.addEventListener('mouseleave', () => {
      label.style.display = 'none'
      el.style.transform = 'translate(-50%,-50%)'
    })
    host.appendChild(el)
    return el
  })
  if (reduced) {
    return
  }
  for (const star of stars) {
    star.style.opacity = '0'
  }
  for (const line of lines) {
    const len = line.getTotalLength()
    line.style.strokeDasharray = String(len)
    line.style.strokeDashoffset = String(len)
  }
  animate(stars, {
    opacity: [0, 1],
    delay: stagger(90, { start: 1250 }),
    duration: 420,
    ease: EASE.outQuad,
    onComplete: () => {
      for (const star of stars) {
        animate(star, {
          opacity: [1, 0.5],
          duration: 1500 + Math.random() * 1800,
          alternate: true,
          loop: true,
          ease: EASE.inOutSine,
          delay: Math.random() * 1400,
        })
      }
    },
  })
  if (lines.length > 0) {
    animate(lines, { strokeDashoffset: 0, delay: stagger(220, { start: 2050 }), duration: 800, ease: EASE.inOutSine })
  }
}

export function useHomeMotion<T extends HTMLElement>(completedConstellations: number) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (root === null) {
      return
    }
    const path = root.querySelector<SVGPathElement>('[data-trail-done]')
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-node]'))
    const you = root.querySelector<HTMLElement>('[data-you]')
    const sky = root.querySelector<HTMLElement>('[data-sky]')

    if (path !== null) {
      const length = path.getTotalLength()
      if (reduced) {
        path.style.strokeDashoffset = '0'
        for (const node of nodes) {
          node.style.opacity = '1'
        }
        if (you !== null) {
          you.style.opacity = '1'
        }
      } else {
        path.style.strokeDasharray = String(length)
        path.style.strokeDashoffset = String(length)
        for (const node of nodes) {
          node.style.opacity = '0'
        }
        if (you !== null) {
          you.style.opacity = '0'
        }
        animate(path, { strokeDashoffset: [length, 0], duration: 1500, ease: EASE.inOutSine })
        animate(nodes, { opacity: [0, 1], scale: [0.4, 1], duration: 520, delay: stagger(190, { start: 260 }), ease: EASE.outBack })
        if (you !== null) {
          animate(you, { opacity: [0, 1], scale: [0.45, 1], translateY: [10, 0], duration: 720, delay: 1050, ease: EASE.outElasticSoft })
        }
      }
    }
    if (sky !== null) {
      buildSky(sky, completedConstellations, reduced)
    }
    return () => {
      if (sky !== null) {
        sky.innerHTML = ''
      }
    }
  }, [reduced, completedConstellations])

  return ref
}
