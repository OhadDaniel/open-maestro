import { useEffect, useState } from 'react'

const ICON_BASE = '/assets/icons'
const cache = new Map<string, string>()

function normalize(raw: string): string {
  return raw
    .split('#000').join('currentColor')
    .replace(/<svg /, '<svg style="width:100%;height:100%;display:block" ')
    .replace(/\swidth="\d+"/, '')
    .replace(/\sheight="\d+"/, '')
}

async function fetchIcon(name: string): Promise<string> {
  const cached = cache.get(name)
  if (cached !== undefined) {
    return cached
  }
  try {
    const response = await fetch(`${ICON_BASE}/${name}.svg`)
    const text = normalize(await response.text())
    cache.set(name, text)
    return text
  } catch {
    cache.set(name, '')
    return ''
  }
}

type IconProps = {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 20, className, style }: IconProps) {
  const [markup, setMarkup] = useState(() => cache.get(name) ?? '')

  useEffect(() => {
    let active = true
    void fetchIcon(name).then((text) => {
      if (active) {
        setMarkup(text)
      }
    })
    return () => {
      active = false
    }
  }, [name])

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
        width: size,
        height: size,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
