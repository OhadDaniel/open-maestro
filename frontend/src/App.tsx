import { ProgressProvider } from './features/progress/ProgressContext'
import { DeckContainer } from './features/deck/components/DeckContainer'
import { SessionProvider } from './features/session/SessionContext'
import { LessonChatProvider } from './features/lessonchat/LessonChatContext'

function App() {
  return (
    <SessionProvider>
      <ProgressProvider>
        <LessonChatProvider>
          <DeckContainer />
        </LessonChatProvider>
      </ProgressProvider>
    </SessionProvider>
  )
}

export default App
