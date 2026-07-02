import { useState } from 'react'

type UseWeekAccordion = {
  openIndex: number | null
  toggle: (index: number) => void
}

export function useWeekAccordion(initialOpen: number): UseWeekAccordion {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpen)

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return { openIndex, toggle }
}
