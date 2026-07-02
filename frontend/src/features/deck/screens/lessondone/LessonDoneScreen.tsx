import { ASSET } from '../../../../shared/assets'
import { Icon } from '../../../../shared/components/Icon'
import { useSegFill } from '../lesson/useSegFill'
import { AppNav } from '../../../appnav/AppNav'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { LessonDoneCard } from './LessonDoneCard'
import { useCompleteLesson } from './useCompleteLesson'

const DIM_THREAD: readonly { readonly role: 'tutor' | 'student'; readonly text: string }[] = [
  { role: 'tutor', text: 'Hello, Ray! — printed exactly right. That\'s input, output, and a variable working together.' },
  { role: 'student', text: 'That was easier than I expected' },
]

export function LessonDoneScreen() {
  const { goTo } = useDeckNav()
  useCompleteLesson()

  return (
    <ScreenShell background="var(--surface)">
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <AppNav active="learn" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <DoneHeader onBack={() => goTo('code')} />
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.16, pointerEvents: 'none', padding: '28px 30px' }}>
              <div style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {DIM_THREAD.map((message) =>
                  message.role === 'tutor' ? (
                    <div key={message.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                        <img src={ASSET.markOnDark} alt="" style={{ width: 19, height: 19 }} />
                      </div>
                      <div style={{ padding: '11px 15px', borderRadius: '4px 20px 20px 20px', background: 'var(--surface-1)', fontSize: 15, lineHeight: 1.5, maxWidth: 460 }}>{message.text}</div>
                    </div>
                  ) : (
                    <div key={message.text} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ padding: '11px 15px', borderRadius: '20px 4px 20px 20px', background: '#1A3426', fontSize: 15, lineHeight: 1.5, maxWidth: 420 }}>{message.text}</div>
                    </div>
                  ),
                )}
              </div>
            </div>
            <LessonDoneCard onFinishWeek={() => goTo('weekdone')} onBackToWeek={() => goTo('week')} />
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}

function DoneHeader({ onBack }: { onBack: () => void }) {
  const fillRef = useSegFill<HTMLDivElement>(100)
  return (
    <div style={{ height: 70, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '0 30px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={onBack} style={{ width: 36, height: 36, borderRadius: 'var(--r-pill)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
          <Icon name="chevron-left" size={17} />
        </button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Input &amp; output</div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>PY101 · Lesson 4</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', gap: 5, width: 280 }}>
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} style={{ flex: 1, height: 6, borderRadius: 'var(--r-pill)', background: index < 4 ? 'var(--accent)' : 'var(--surface-2)', overflow: 'hidden' }}>
              {index === 4 && <div ref={fillRef} style={{ width: '0%', height: '100%', background: 'var(--accent)', borderRadius: 'var(--r-pill)' }} />}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>Step 5 of 5</span>
      </div>
    </div>
  )
}
