import { createContext, useContext } from 'react'
import { useLessonChatContext } from '../../../lessonchat/LessonChatContext'
import { useSession } from '../../../session/SessionContext'
import { useLessonThread } from './useLessonThread'

type LessonThreadValue = ReturnType<typeof useLessonThread>

const LessonThreadContext = createContext<LessonThreadValue | null>(null)

function ActiveThread({ children }: { children: React.ReactNode }) {
  const { baked } = useLessonChatContext()
  const { provider } = useSession()
  const value = useLessonThread(baked!, provider)
  return <LessonThreadContext.Provider value={value}>{children}</LessonThreadContext.Provider>
}

export function LessonThreadProvider({ children }: { children: React.ReactNode }) {
  const { baked, ready } = useLessonChatContext()
  if (!ready || baked === null) {
    return <>{children}</>
  }
  return <ActiveThread key={baked.lesson.id}>{children}</ActiveThread>
}

export function useLessonThreadContext(): LessonThreadValue {
  const value = useContext(LessonThreadContext)
  if (value === null) {
    throw new Error('useLessonThreadContext must be used within a LessonThreadProvider')
  }
  return value
}
