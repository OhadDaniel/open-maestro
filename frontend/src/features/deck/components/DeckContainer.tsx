import { useMemo } from 'react'
import { useProgressContext } from '../../progress/ProgressContext'
import { DeckNavProvider } from '../DeckContext'
import { useDeck } from '../useDeck'
import { useFit } from '../useFit'
import { Deck } from './Deck'

export function DeckContainer() {
  const { state } = useProgressContext()
  const initialScreen = state.firstRunDone ? 'home' : 'welcome'
  const { current, transition, goTo } = useDeck(initialScreen)
  const scale = useFit()
  const nav = useMemo(() => ({ goTo }), [goTo])

  return (
    <DeckNavProvider value={nav}>
      <Deck current={current} transition={transition} scale={scale} />
    </DeckNavProvider>
  )
}
