import { ASSET } from '../../../../shared/assets'
import { useParallax } from '../../../../shared/motion/useParallax'
import { useProgressContext } from '../../../progress/ProgressContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { GETKNOW_COPY, GETKNOW_QUESTIONS } from './getknow.constants'
import { GetKnowQuestion } from './GetKnowQuestion'
import { GetKnowWrap } from './GetKnowWrap'
import { useGetKnow } from './useGetKnow'
import { useGetKnowMotion } from './useGetKnowMotion'

const SEG_ACTIVE = 'var(--accent)'
const SEG_IDLE = 'var(--surface-2)'

export function GetKnowScreen() {
  const parallaxRef = useParallax<HTMLDivElement>()
  const { step, total, selected, echoParts, name, pick } = useGetKnow()
  const panelRef = useGetKnowMotion<HTMLDivElement>(step)
  const { markFirstRunDone } = useProgressContext()
  const { goTo } = useDeckNav()

  const onPick = (questionIndex: number, optionIndex: number) => {
    pick(questionIndex, GETKNOW_QUESTIONS[questionIndex].options[optionIndex])
  }

  const onFinish = () => {
    markFirstRunDone()
    goTo('home')
  }

  const counter = step < total ? `Question ${step + 1} of 3` : 'Lesson 0 complete'
  const question = step < total ? GETKNOW_QUESTIONS[step] : null

  return (
    <ScreenShell>
      <div ref={parallaxRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img data-plx-img src={ASSET.climbBasecamp} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '64% 78%', opacity: 0.14, transform: 'scale(1.06)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 55% at 50% 28%,rgba(166,178,247,.09),transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,#000 6%,rgba(0,0,0,.4) 40%,rgba(0,0,0,.7) 100%)' }} />

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 40px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <img src={ASSET.markOnDark} alt="" style={{ width: 36, height: 36, display: 'block' }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{GETKNOW_COPY.headerTitle}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{GETKNOW_COPY.headerSub}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {Array.from({ length: total }, (_, index) => (
                <div key={index} style={{ width: 44, height: 6, borderRadius: 'var(--r-pill)', background: index < step ? SEG_ACTIVE : SEG_IDLE }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{counter}</span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 88, bottom: 0, zIndex: 5 }}>
          <div key={step} ref={panelRef} style={{ position: 'absolute', inset: 0, opacity: 0 }}>
            {question !== null ? (
              <GetKnowQuestion question={question} questionIndex={step} name={name} selectedValue={selected[step]} onPick={onPick} />
            ) : (
              <GetKnowWrap name={name} onFinish={onFinish} />
            )}
          </div>
        </div>

        <img src={ASSET.walkPeak} alt="" style={{ position: 'absolute', right: 30, bottom: 14, width: 300, height: 300, objectFit: 'cover', opacity: 0.5, zIndex: 1, pointerEvents: 'none', WebkitMaskImage: 'radial-gradient(closest-side,#000 55%,transparent 82%)', maskImage: 'radial-gradient(closest-side,#000 55%,transparent 82%)' }} />
        {echoParts.length > 0 && (
          <span style={{ position: 'absolute', left: 40, bottom: 26, zIndex: 10, display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 13px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border)', background: 'rgba(18,18,17,.7)', color: 'var(--fg-2)', fontSize: 13 }}>
            {echoParts.join(' · ')}
          </span>
        )}
      </div>
    </ScreenShell>
  )
}
