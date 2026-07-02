import { Icon } from '../../../../shared/components/Icon'
import type { WeekView } from '../../../course/course.types'
import { WEEK_COPY, lockedSub, progressSub } from './week.constants'

type WeekAccordionItemProps = {
  week: WeekView
  open: boolean
  onToggle: () => void
  onOpenLesson: (weekIndex: number, lessonIndex: number) => void
}

const HEADER_ICON = {
  done: <Icon name="check" size={14} />,
  locked: <Icon name="lock-03" size={13} />,
} as const

function headerBadge(week: WeekView) {
  if (week.status === 'done') {
    return { bg: 'rgba(206,245,133,.16)', border: '1.5px solid var(--accent)', color: 'var(--accent)', node: HEADER_ICON.done }
  }
  if (week.status === 'current') {
    return { bg: 'var(--accent)', border: 'none', color: 'var(--ink)', node: <span style={{ fontWeight: 700, fontSize: 14 }}>{week.index + 1}</span> }
  }
  return { bg: 'rgba(255,255,255,.04)', border: '1.5px solid var(--border-strong)', color: 'var(--fg-3)', node: HEADER_ICON.locked }
}

export function WeekAccordionItem({ week, open, onToggle, onOpenLesson }: WeekAccordionItemProps) {
  const isCurrent = week.status === 'current'
  const isLocked = week.status === 'locked'
  const badge = headerBadge(week)
  const lessonCount = week.lessonTitles.length
  const subColor = isCurrent ? 'var(--accent)' : 'var(--fg-3)'
  const sub = week.status === 'done'
    ? `${lessonCount} lessons · completed`
    : isCurrent
      ? progressSub(week.lessonsDone, lessonCount)
      : lockedSub(week.index)

  return (
    <div style={{ border: isCurrent ? '1.5px solid var(--accent)' : '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: isCurrent ? 'rgba(206,245,133,.04)' : 'var(--surface)', marginBottom: 12, opacity: isLocked ? 0.7 : 1, boxShadow: isCurrent ? '0 0 34px -14px rgba(206,245,133,.5)' : 'none' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', cursor: 'pointer' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: badge.bg, border: badge.border, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{badge.node}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: isLocked ? 'var(--fg-2)' : 'var(--fg)' }}>Week {week.index + 1} · {week.title}</div>
          <div style={{ fontSize: 13, color: subColor, fontWeight: isCurrent ? 500 : 400 }}>{sub}</div>
        </div>
        <Icon name="chevron-down" size={18} style={{ color: 'var(--fg-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .3s var(--e-out)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .32s var(--e-out)' }}>
        <div style={{ overflow: 'hidden' }}>
          {isLocked ? (
            <div style={{ padding: '0 18px 14px 48px', fontSize: 13, color: 'var(--fg-3)' }}>Finish Week {week.index} to unlock these lessons.</div>
          ) : (
            <div style={{ padding: '2px 18px 14px 18px' }}>
              {week.lessonTitles.map((title, lessonIndex) => {
                const done = lessonIndex < week.lessonsDone
                const isNext = isCurrent && lessonIndex === week.lessonsDone
                if (isNext) {
                  return (
                    <div key={title} onClick={() => onOpenLesson(week.index, lessonIndex)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px 12px 46px', marginTop: 4, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--accent)', cursor: 'pointer' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>{title}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>Lesson {lessonIndex + 1} · up next</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px', borderRadius: 'var(--r-pill)', background: 'var(--accent)', color: 'var(--ink)', fontSize: 14, fontWeight: 600 }}>
                        {WEEK_COPY.continue}
                        <Icon name="arrow-right" size={16} />
                      </span>
                    </div>
                  )
                }
                return (
                  <div
                    key={title}
                    onClick={done ? () => onOpenLesson(week.index, lessonIndex) : undefined}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px 11px 48px', color: done ? 'var(--fg-2)' : 'var(--fg-3)', cursor: done ? 'pointer' : 'default', borderRadius: 10 }}
                  >
                    <Icon name={done ? 'check-circle' : 'lock-03'} size={17} style={{ color: done ? 'var(--accent)' : 'var(--fg-3)' }} />
                    <span style={{ fontSize: 14 }}>{title}</span>
                    {done && <Icon name="chevron-right" size={15} style={{ color: 'var(--fg-3)', marginLeft: 'auto' }} />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
