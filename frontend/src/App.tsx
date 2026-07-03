import { ProgressProvider } from './features/progress/ProgressContext'
import { DeckContainer } from './features/deck/components/DeckContainer'
import { SessionProvider } from './features/session/SessionContext'
import { LessonViewProvider } from './features/lessonview/LessonViewContext'
import { LessonChatProvider } from './features/lessonchat/LessonChatContext'
import { LessonThreadProvider } from './features/deck/screens/lesson/LessonThreadContext'

function App() {
  return (
    <SessionProvider>
      <ProgressProvider>
        <LessonViewProvider>
          <LessonChatProvider>
            <LessonThreadProvider>
              <DeckContainer />
            </LessonThreadProvider>
          </LessonChatProvider>
        </LessonViewProvider>
      </ProgressProvider>
    </SessionProvider>
  )
}

export default App
