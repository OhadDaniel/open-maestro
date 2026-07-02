import { createContext, useContext } from 'react'
import { useSessionState } from './useSessionState'

type SessionValue = ReturnType<typeof useSessionState>

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const value = useSessionState()
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (value === null) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return value
}
