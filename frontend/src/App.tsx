import { useState } from 'react'
import type { TutorProvider } from './ai/provider'
import { BAKED_LESSON_SLUGS } from './content/samples/py101-catalog'
import { LessonPage } from './features/lesson/components/LessonPage'
import { WeekComplete } from './features/lesson/components/WeekComplete'
import { Onboarding } from './features/onboarding/components/Onboarding'

const COURSE_ID = 'py101'
const SEQUENCE = BAKED_LESSON_SLUGS

function App() {
  const [provider, setProvider] = useState<TutorProvider | null>(null)
  const [index, setIndex] = useState(0)

  if (provider === null) {
    return <Onboarding onReady={setProvider} />
  }
  if (index >= SEQUENCE.length) {
    return <WeekComplete onRestart={() => setIndex(0)} />
  }
  return (
    <LessonPage
      key={SEQUENCE[index]}
      provider={provider}
      courseId={COURSE_ID}
      slug={SEQUENCE[index]}
      lessonNumber={index + 1}
      lessonCount={SEQUENCE.length}
      onNext={() => setIndex((current) => current + 1)}
    />
  )
}

export default App
