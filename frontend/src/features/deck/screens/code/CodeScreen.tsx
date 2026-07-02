import { useEffect, useMemo, useRef, useState } from 'react'
import type { TutorProvider } from '../../../../ai/provider'
import { resolveTutorProvider } from '../../../../ai/resolve-provider'
import type { BakedLesson } from '../../../../content/baked.types'
import { loadProfile, saveProfile } from '../../../../memory/profile-store'
import type { LearnerProfile } from '../../../../memory/learner-profile.types'
import { createSession } from '../../../../tutor/session'
import { useTutorChat } from '../../../lesson/hooks/useTutorChat'
import { useLessonChatContext } from '../../../lessonchat/LessonChatContext'
import { useSession } from '../../../session/SessionContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { CodeChatPane } from './CodeChatPane'
import { CodeEditorPane } from './CodeEditorPane'

function runMessage(code: string, output: string): string {
  return `I ran this code:\n\n${code}\n\nOutput:\n${output.trim().length > 0 ? output.trim() : '(no output)'}`
}

export function CodeScreen() {
  const { baked, ready } = useLessonChatContext()
  if (!ready || baked === null) {
    return (
      <ScreenShell background="var(--surface)">
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 14 }}>Loading your lesson…</div>
      </ScreenShell>
    )
  }
  return <CodeSession baked={baked} />
}

function CodeSession({ baked }: { baked: BakedLesson }) {
  const { goTo } = useDeckNav()
  const { provider } = useSession()
  const { code, setCode, run, running, runResult, runCount, hasRun } = useLessonChatContext()
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile())
  const session = useMemo(() => createSession(baked.lesson.id), [baked.lesson.id])
  const tutorProvider = useMemo<TutorProvider>(
    () => resolveTutorProvider(provider, baked, profile.name),
    [provider, baked, profile.name],
  )
  const onProfileLearned = (learned: LearnerProfile) => {
    saveProfile(learned)
    setProfile(learned)
  }
  const { messages, isStreaming, sendMessage } = useTutorChat(
    tutorProvider,
    baked,
    session,
    profile,
    onProfileLearned,
    () => undefined,
  )

  const handledRunRef = useRef(runCount)
  useEffect(() => {
    if (runCount > handledRunRef.current && runResult !== null) {
      handledRunRef.current = runCount
      void sendMessage(runMessage(code, runResult.output))
    }
  }, [runCount, runResult, code, sendMessage])

  return (
    <ScreenShell background="var(--surface)">
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <CodeChatPane
          title={baked.lesson.title}
          messages={messages}
          isStreaming={isStreaming}
          onBack={() => goTo('lesson')}
          onFinish={() => goTo('lessondone')}
        />
        <CodeEditorPane
          code={code}
          onCodeChange={setCode}
          onRun={() => void run()}
          onBack={() => goTo('lesson')}
          running={running}
          consoleOpen={hasRun}
          result={runResult}
        />
      </div>
    </ScreenShell>
  )
}
