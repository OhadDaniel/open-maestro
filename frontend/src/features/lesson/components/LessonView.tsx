import type { BakedLesson } from '../../../content/baked.types'
import { Confetti } from '../../celebration/Confetti'
import { CodeRunner } from '../../code/components/CodeRunner'
import { LESSON_LABELS } from '../lesson.constants'
import type { ChatMessage } from '../lesson.types'
import { TutorChat } from './TutorChat'

const CELEBRATION_BURST = 90

type LessonViewProps = {
  baked: BakedLesson
  lessonNumber: number
  lessonCount: number
  isLast: boolean
  messages: ChatMessage[]
  isStreaming: boolean
  checkPrompt: string
  celebrationText: string
  onSend: (text: string) => void
  onCodeSubmit: (code: string, output: string) => void
  onUnderstood: () => void
  onNextLesson: () => void
}

export function LessonView(props: LessonViewProps) {
  return (
    <div className="lesson">
      <aside className="lesson-rail" aria-label={LESSON_LABELS.progressRail}>
        <span className="lesson-step">
          Lesson {props.lessonNumber} of {props.lessonCount}
        </span>
      </aside>
      <main className="lesson-main">
        <header className="lesson-header">
          <span className="lesson-eyebrow">{props.baked.concept}</span>
          <h1 className="lesson-title">{props.baked.lesson.title}</h1>
        </header>
        <TutorChat
          messages={props.messages}
          isStreaming={props.isStreaming}
          onSend={props.onSend}
        />
        <CodeRunner initialCode="" onSubmit={props.onCodeSubmit} />
        <section className="lesson-check">
          <p className="lesson-check-prompt">{props.checkPrompt}</p>
          <div className="lesson-check-actions">
            <button type="button" className="btn" onClick={props.onUnderstood}>
              {LESSON_LABELS.understood}
            </button>
            <button type="button" className="btn btn-primary" onClick={props.onNextLesson}>
              {props.isLast ? 'Complete week 🎉' : 'Next lesson →'}
            </button>
          </div>
        </section>
        <div className="lesson-celebration" aria-live="polite">
          {props.celebrationText}
        </div>
        {props.celebrationText !== '' && (
          <Confetti key={props.celebrationText} count={CELEBRATION_BURST} />
        )}
      </main>
    </div>
  )
}
