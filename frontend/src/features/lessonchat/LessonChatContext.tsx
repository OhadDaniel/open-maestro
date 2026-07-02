import { createContext, useContext } from 'react'
import { useLessonChat } from './hooks/useLessonChat'

type LessonChatValue = ReturnType<typeof useLessonChat>

const LessonChatContext = createContext<LessonChatValue | null>(null)

export function LessonChatProvider({ children }: { children: React.ReactNode }) {
  const value = useLessonChat()
  return <LessonChatContext.Provider value={value}>{children}</LessonChatContext.Provider>
}

export function useLessonChatContext(): LessonChatValue {
  const value = useContext(LessonChatContext)
  if (value === null) {
    throw new Error('useLessonChatContext must be used within a LessonChatProvider')
  }
  return value
}
