import { createContext, useContext } from 'react'
import type { ScreenId } from './deck.types'

type DeckNav = {
  goTo: (id: ScreenId) => void
  next: () => void
  prev: () => void
  restart: () => void
}

const DeckContext = createContext<DeckNav | null>(null)

export function DeckNavProvider({ value, children }: { value: DeckNav; children: React.ReactNode }) {
  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>
}

export function useDeckNav(): DeckNav {
  const value = useContext(DeckContext)
  if (value === null) {
    throw new Error('useDeckNav must be used within a DeckNavProvider')
  }
  return value
}
