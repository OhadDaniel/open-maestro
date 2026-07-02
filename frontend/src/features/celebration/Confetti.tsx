import { useEffect, useRef } from 'react'

const DEFAULT_COUNT = 140
const GRAVITY = 0.22
const DRAG = 0.008
const FADE = 0.012
const LAUNCH_SPREAD = 14
const LAUNCH_BASE = 4
const LAUNCH_LIFT = 6
const MIN_SIZE = 4
const SIZE_RANGE = 8
const SPIN_RANGE = 0.3
const ORIGIN_Y_RATIO = 0.34
const LIFETIME_MS = 2600
const COLORS = ['#7c5cff', '#6366f1', '#ec4899', '#22d3ee', '#f5c542', '#ffffff']

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  spin: number
  life: number
}

type ConfettiProps = {
  count?: number
}

export function Confetti({ count = DEFAULT_COUNT }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }
    const context = canvas.getContext('2d')
    if (context === null) {
      return
    }
    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    context.scale(dpr, dpr)

    const originX = width / 2
    const originY = height * ORIGIN_Y_RATIO
    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * LAUNCH_SPREAD + LAUNCH_BASE
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - LAUNCH_LIFT,
        size: Math.random() * SIZE_RANGE + MIN_SIZE,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0],
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * SPIN_RANGE,
        life: 1,
      }
    })

    const start = performance.now()
    let frame = 0
    const render = (now: number) => {
      context.clearRect(0, 0, width, height)
      for (const particle of particles) {
        particle.vx *= 1 - DRAG
        particle.vy = particle.vy * (1 - DRAG) + GRAVITY
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.spin
        particle.life -= FADE
        if (particle.life <= 0) {
          continue
        }
        context.save()
        context.globalAlpha = particle.life
        context.translate(particle.x, particle.y)
        context.rotate(particle.rotation)
        context.fillStyle = particle.color
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6)
        context.restore()
      }
      if (now - start < LIFETIME_MS) {
        frame = requestAnimationFrame(render)
      }
    }
    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [count])

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />
}
