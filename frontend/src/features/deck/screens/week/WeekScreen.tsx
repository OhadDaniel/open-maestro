import { Icon } from '../../../../shared/components/Icon'
import { COURSE_LEVEL_COUNT } from '../../../course/course.constants'
import { useCoursePosition } from '../../../course/useCoursePosition'
import { useLessonViewContext } from '../../../lessonview/LessonViewContext'
import { AppNav } from '../../../appnav/AppNav'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { WeekAccordionItem } from './WeekAccordionItem'
import { WeekRail } from './WeekRail'
import { WEEK_COPY, weekSubtitle } from './week.constants'
import { useWeekAccordion } from './useWeekAccordion'

export function WeekScreen() {
  const { streak } = useSession()
  const { goTo } = useDeckNav()
  const { openLessonAt } = useLessonViewContext()
  const { currentWeekIndex, levelPct, weeks } = useCoursePosition()
  const openLesson = (weekIndex: number, lessonIndex: number) => {
    openLessonAt(weekIndex, lessonIndex)
    goTo('lesson')
  }
  const { openIndex, toggle } = useWeekAccordion(currentWeekIndex)
  const currentWeek = weeks[currentWeekIndex]
  const lessonsToGo = (currentWeek?.lessonTitles.length ?? 0) - (currentWeek?.lessonsDone ?? 0)

  return (
    <ScreenShell background="var(--surface)">
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <AppNav active="learn" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '34px 44px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-3)', marginBottom: 22 }}>
            <span onClick={() => goTo('home')} style={{ cursor: 'pointer' }}>{WEEK_COPY.breadcrumbRoot}</span>
            <Icon name="chevron-right" size={13} />
            <span style={{ color: 'var(--fg-2)' }}>Level {currentWeekIndex + 1} · {currentWeek?.title}</span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.01em' }}>{currentWeek?.title}</h1>
          <p style={{ fontSize: 15, color: 'var(--fg-2)', marginTop: 6 }}>{weekSubtitle(currentWeekIndex, COURSE_LEVEL_COUNT)}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 30px', maxWidth: 520 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 'var(--r-pill)', background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ width: `${levelPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--r-pill)' }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600 }}>{levelPct}%</span>
          </div>
          <div style={{ maxWidth: 640 }}>
            {weeks.map((week) => (
              <WeekAccordionItem
                key={week.index}
                week={week}
                open={openIndex === week.index}
                onToggle={() => toggle(week.index)}
                onOpenLesson={openLesson}
              />
            ))}
          </div>
        </div>
        <WeekRail levelLabel={`Level ${currentWeekIndex + 1}`} levelPct={levelPct} lessonsToGo={lessonsToGo} streakDays={streak.days} />
      </div>
    </ScreenShell>
  )
}
