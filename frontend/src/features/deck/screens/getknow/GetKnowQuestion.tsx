import { MaestroMark } from '../../../../shared/components/MaestroMark'
import { AnswerCard } from './AnswerCard'
import { questionTitle, type GetKnowQuestion as Question } from './getknow.constants'

type GetKnowQuestionProps = {
  question: Question
  questionIndex: number
  name: string
  selectedValue: string | undefined
  onPick: (index: number, optionIndex: number) => void
}

export function GetKnowQuestion({ question, questionIndex, name, selectedValue, onPick }: GetKnowQuestionProps) {
  const columnWidth = question.columns === 2 ? 310 : 250
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 90px 30px' }}>
      <MaestroMark size={58} glow="lavender" />
      <h1 style={{ fontSize: 42, lineHeight: 1.12, fontWeight: 700, letterSpacing: '-.015em', textAlign: 'center', maxWidth: 780 }}>
        {questionTitle(question.prompt, name)}
      </h1>
      <div
        style={{
          display: question.columns === 2 ? 'grid' : 'flex',
          gridTemplateColumns: question.columns === 2 ? 'repeat(2,310px)' : undefined,
          gap: 14,
        }}
      >
        {question.options.map((option, optionIndex) => (
          <AnswerCard
            key={option.value}
            option={option}
            width={columnWidth}
            selected={selectedValue === option.value}
            onSelect={() => onPick(questionIndex, optionIndex)}
          />
        ))}
      </div>
    </div>
  )
}
