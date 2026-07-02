import { Icon } from '../../../../shared/components/Icon'
import { useLessonViewContext } from '../../../lessonview/LessonViewContext'
import { useSegFill } from '../lesson/useSegFill'
import { AppNav } from '../../../appnav/AppNav'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { LessonDoneCard, type LessonDoneMode } from './LessonDoneCard'
import { lessonDoneSubtitle } from './lessondone.constants'
import { useCompleteLesson } from './useCompleteLesson'

export function LessonDoneScreen() {
  const { goTo } = useDeckNav()
  const { clearView } = useLessonViewContext()
  const finished = useCompleteLesson()
  const meta = `PY101 · Lesson ${finished.lessonNumber}`
  const subtitle = lessonDoneSubtitle(finished.title, finished.lessonNumber, finished.lessonsInWeek)
  const mode: LessonDoneMode = !finished.isFrontier
    ? 'review'
    : finished.isLastOfWeek
      ? 'finish-week'
      : 'advance'

  return (
    <ScreenShell background="var(--surface)">
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <AppNav active="learn" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <DoneHeader title={finished.title} meta={meta} lessonNumber={finished.lessonNumber} total={finished.lessonsInWeek} onBack={() => goTo('code')} />
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            <LessonDoneCard
              title={finished.title}
              subtitle={subtitle}
              mode={mode}
              weekNumber={finished.weekNumber}
              onContinue={() => {
                clearView()
                goTo('lesson')
              }}
              onFinishWeek={() => goTo('weekdone')}
              onBackToWeek={() => goTo('week')}
            />
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}

type DoneHeaderProps = {
  title: string
  meta: string
  lessonNumber: number
  total: number
  onBack: () => void
}

function DoneHeader({ title, meta, lessonNumber, total, onBack }: DoneHeaderProps) {
  const fillRef = useSegFill<HTMLDivElement>(100)
  const segments = Array.from({ length: total }, (_, index) => index)
  return (
    <div style={{ height: 70, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '0 30px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={onBack} style={{ width: 36, height: 36, borderRadius: 'var(--r-pill)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' }}>
          <Icon name="chevron-left" size={17} />
        </button>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{meta}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', gap: 5, width: 280 }}>
          {segments.map((index) => (
            <div key={index} style={{ flex: 1, height: 6, borderRadius: 'var(--r-pill)', background: index < lessonNumber - 1 ? 'var(--accent)' : 'var(--surface-2)', overflow: 'hidden' }}>
              {index === lessonNumber - 1 && <div ref={fillRef} style={{ width: '0%', height: '100%', background: 'var(--accent)', borderRadius: 'var(--r-pill)' }} />}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>Lesson {lessonNumber} of {total}</span>
      </div>
    </div>
  )
}
