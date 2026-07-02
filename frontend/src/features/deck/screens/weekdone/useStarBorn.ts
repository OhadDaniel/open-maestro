import { animate, stagger } from 'animejs'
import { EASE } from '../../../../shared/motion/easing'
import { WD_CAMP, WD_STAR_DECOR, WD_STAR_LAND, WD_STAR_LINES } from './weekdone.constants'

const SVG_NS = 'http://www.w3.org/2000/svg'

export function starBorn(host: HTMLElement) {
  host.innerHTML = ''
  const decorStars = WD_STAR_DECOR.map(([x, y]) => {
    const el = document.createElement('span')
    el.style.cssText = 'position:absolute;width:4px;height:4px;border-radius:9999px;background:#E9EBFF;box-shadow:0 0 8px rgba(166,178,247,.8);opacity:.35;transform:translate(-50%,-50%)'
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    host.appendChild(el)
    return el
  })

  const born = document.createElement('span')
  born.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:9999px;background:#FFFDF2;box-shadow:0 0 14px rgba(236,235,228,.95);opacity:0;margin-left:-3.5px;margin-top:-3.5px'
  born.style.left = `${WD_CAMP[0]}px`
  born.style.top = `${WD_CAMP[1]}px`
  host.appendChild(born)
  animate(born, {
    opacity: [0, 1],
    translateX: [0, WD_STAR_LAND[0] - WD_CAMP[0]],
    translateY: [0, WD_STAR_LAND[1] - WD_CAMP[1]],
    duration: 800,
    ease: EASE.outCubic,
  })

  const ring = document.createElement('span')
  ring.style.cssText = 'position:absolute;width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(236,235,228,.85);opacity:0;margin-left:-22px;margin-top:-22px'
  ring.style.left = `${WD_STAR_LAND[0]}px`
  ring.style.top = `${WD_STAR_LAND[1]}px`
  host.appendChild(ring)
  animate(ring, { opacity: [0.9, 0], scale: [0.3, 1.7], delay: 800, duration: 600, ease: EASE.outQuad, onComplete: () => ring.remove() })
  animate(decorStars, { opacity: [0.35, 1], delay: stagger(110, { start: 850 }), duration: 360, ease: EASE.outQuad })

  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 1240 760')
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
  const lines = WD_STAR_LINES.map((points) => {
    const line = document.createElementNS(SVG_NS, 'polyline')
    line.setAttribute('points', points.map(([x, y]) => `${x},${y}`).join(' '))
    line.setAttribute('fill', 'none')
    line.setAttribute('stroke', 'rgba(166,178,247,.42)')
    line.setAttribute('stroke-width', '1')
    svg.appendChild(line)
    return line
  })
  host.appendChild(svg)
  for (const line of lines) {
    const length = line.getTotalLength()
    line.style.strokeDasharray = String(length)
    line.style.strokeDashoffset = String(length)
  }
  animate(lines, { strokeDashoffset: 0, delay: stagger(160, { start: 1000 }), duration: 520, ease: EASE.inOutSine })
}
