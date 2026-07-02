import { createContext, useContext } from 'react'
import { useLessonView } from './useLessonView'

type LessonViewValue = ReturnType<typeof useLessonView>

const LessonViewContext = createContext<LessonViewValue | null>(null)

export function LessonViewProvider({ children }: { children: React.ReactNode }) {
  const value = useLessonView()
  return <LessonViewContext.Provider value={value}>{children}</LessonViewContext.Provider>
}

export function useLessonViewContext(): LessonViewValue {
  const value = useContext(LessonViewContext)
  if (value === null) {
    throw new Error('useLessonViewContext must be used within a LessonViewProvider')
  }
  return value
}
