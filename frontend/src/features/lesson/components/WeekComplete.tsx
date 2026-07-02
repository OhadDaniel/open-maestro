import { Confetti } from '../../celebration/Confetti'

type WeekCompleteProps = {
  onRestart: () => void
}

export function WeekComplete({ onRestart }: WeekCompleteProps) {
  return (
    <main className="onboard">
      <Confetti />
      <div className="onboard-card">
        <span className="onboard-badge">Milestone reached</span>
        <h1 className="onboard-title">Week complete 🎉</h1>
        <p className="onboard-sub">
          You finished Week 1 — Writing your first program. You can print text,
          work with variables and numbers, and turn real problems into code.
          That is a genuine foundation.
        </p>
        <button type="button" className="btn btn-primary onboard-btn" onClick={onRestart}>
          Back to the start
        </button>
        <p className="onboard-fine">
          Next up in the AI Engineering degree: Core foundations — division,
          functions, and more.
        </p>
      </div>
    </main>
  )
}
