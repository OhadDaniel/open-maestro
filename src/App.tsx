import { BRAND } from './app.constants'

function App() {
  return (
    <main className="app-shell">
      <div className="brand">
        <h1 className="brand-name">{BRAND.name}</h1>
        <p className="brand-tagline">{BRAND.tagline}</p>
        <span className="brand-badge">{BRAND.status}</span>
      </div>
    </main>
  )
}

export default App
