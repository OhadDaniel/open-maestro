import { createContext, useContext } from 'react'
import { useProgress } from './useProgress'

type ProgressValue = ReturnType<typeof useProgress>

const ProgressContext = createContext<ProgressValue | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const value = useProgress()
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgressContext(): ProgressValue {
  const value = useContext(ProgressContext)
  if (value === null) {
    throw new Error('useProgressContext must be used within a ProgressProvider')
  }
  return value
}
