import { DeckContainer } from './features/deck/components/DeckContainer'
import { SessionProvider } from './features/session/SessionContext'

function App() {
  return (
    <SessionProvider>
      <DeckContainer />
    </SessionProvider>
  )
}

export default App
