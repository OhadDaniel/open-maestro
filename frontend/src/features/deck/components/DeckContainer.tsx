import { useEffect, useMemo } from 'react'
import { DeckNavProvider } from '../DeckContext'
import { useDeck } from '../useDeck'
import { useFit } from '../useFit'
import { Deck } from './Deck'

export function DeckContainer() {
  const { current, transition, goTo, next, prev, restart } = useDeck()
  const scale = useFit()
  const nav = useMemo(() => ({ goTo, next, prev, restart }), [goTo, next, prev, restart])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        next()
      } else if (event.key === 'ArrowLeft') {
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  return (
    <DeckNavProvider value={nav}>
      <Deck current={current} transition={transition} scale={scale} />
    </DeckNavProvider>
  )
}
