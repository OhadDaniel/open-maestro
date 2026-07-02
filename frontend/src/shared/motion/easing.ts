export const EASE = {
  outCubic: 'outCubic',
  inQuad: 'inQuad',
  inOutQuad: 'inOutQuad',
  inOutQuart: 'inOutQuart',
  inOutSine: 'inOutSine',
  outQuad: 'outQuad',
  outQuint: 'outQuint',
  outBack: 'outBack',
  outElasticSoft: 'outElastic(1, .55)',
  outElasticMed: 'outElastic(1, .5)',
  outElasticWide: 'outElastic(1, .6)',
  linear: 'linear',
} as const

export const DURATION = {
  instant: 80,
  fast: 150,
  base: 200,
  moderate: 300,
  slow: 450,
  emphasis: 600,
  reveal: 560,
  trail: 1500,
  download: 5200,
  lineMask: 780,
  typing: 1750,
} as const

export const REVEAL_STAGGER = 70
export const REVEAL_START = 60
