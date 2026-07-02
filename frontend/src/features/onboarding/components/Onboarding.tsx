import { useState } from 'react'
import type { TutorProvider } from '../../../ai/provider'
import { WebLlmProvider, isWebGpuAvailable, pickBestModel } from '../../../ai/webllm-provider'
import { ONBOARDING } from '../onboarding.constants'

type OnboardingProps = {
  onReady: (provider: TutorProvider) => void
}

export function Onboarding({ onReady }: OnboardingProps) {
  const [percent, setPercent] = useState<number | null>(null)
  const [unsupported, setUnsupported] = useState(false)

  const start = () => {
    if (!isWebGpuAvailable()) {
      setUnsupported(true)
      return
    }
    setPercent(0)
    WebLlmProvider.create(pickBestModel(), (report) => setPercent(report.progress))
      .then((provider) => onReady(provider))
      .catch(() => {
        setPercent(null)
        setUnsupported(true)
      })
  }

  return (
    <main className="onboard">
      <div className="onboard-card">
        <span className="onboard-badge">{ONBOARDING.badge}</span>
        <h1 className="onboard-title">{ONBOARDING.title}</h1>
        <p className="onboard-sub">{ONBOARDING.subtitle}</p>
        {unsupported ? (
          <p className="onboard-note">{ONBOARDING.unsupported}</p>
        ) : percent === null ? (
          <button type="button" className="btn btn-primary onboard-btn" onClick={start}>
            {ONBOARDING.cta}
          </button>
        ) : (
          <div className="onboard-progress">
            <div className="onboard-bar">
              <div
                className="onboard-bar-fill"
                style={{ width: `${Math.round(percent * 100)}%` }}
              />
            </div>
            <span className="onboard-pct">
              {ONBOARDING.downloading} {Math.round(percent * 100)}%
            </span>
          </div>
        )}
        {!unsupported && (
          <div className="onboard-chips">
            {ONBOARDING.chips.map((chip) => (
              <span key={chip} className="onboard-chip">
                {chip}
              </span>
            ))}
          </div>
        )}
        <p className="onboard-fine">{ONBOARDING.fine}</p>
      </div>
    </main>
  )
}
