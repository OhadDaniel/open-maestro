import { useCallback, useRef, useState } from 'react'
import { useSession } from '../../../session/SessionContext'
import { GETKNOW_QUESTIONS, GETKNOW_COPY, type GetKnowOption } from './getknow.constants'

const TOTAL = GETKNOW_QUESTIONS.length

export function useGetKnow() {
  const { user, updateUser } = useSession()
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [echo, setEcho] = useState<string[]>([])
  const timer = useRef<number | null>(null)

  const pick = useCallback(
    (questionIndex: number, option: GetKnowOption) => {
      const question = GETKNOW_QUESTIONS[questionIndex]
      setSelected((current) => ({ ...current, [questionIndex]: option.value }))
      setEcho((current) => {
        const next = [...current]
        next[questionIndex] = option.echo
        return next
      })
      updateUser({ [question.field]: option.value })
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
      }
      timer.current = window.setTimeout(() => {
        setStep((currentStep) => Math.min(currentStep + 1, TOTAL))
      }, GETKNOW_COPY.autoAdvanceMs)
    },
    [updateUser],
  )

  return {
    step,
    total: TOTAL,
    selected,
    echoParts: echo.filter(Boolean),
    name: user.name,
    pick,
  }
}
