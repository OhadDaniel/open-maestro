import { ProgressProvider } from './features/progress/ProgressContext'
import { DeckContainer } from './features/deck/components/DeckContainer'
import { SessionProvider } from './features/session/SessionContext'

function App() {
  return (
    <SessionProvider>
      <ProgressProvider>
        <DeckContainer />
      </ProgressProvider>
    </SessionProvider>
  )
}

export default App
