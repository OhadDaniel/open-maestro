import { useEffect, useRef } from 'react'
import { useLessonChatContext } from '../../../lessonchat/LessonChatContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { useLessonThreadContext } from '../lesson/LessonThreadContext'
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

function CodeSession({ baked }: { baked: NonNullable<ReturnType<typeof useLessonChatContext>['baked']> }) {
  const { goTo } = useDeckNav()
  const { code, setCode, run, running, runResult, runCount, hasRun } = useLessonChatContext()
  const { messages, isStreaming, send } = useLessonThreadContext()

  const handledRunRef = useRef(runCount)
  useEffect(() => {
    if (runCount > handledRunRef.current && runResult !== null) {
      handledRunRef.current = runCount
      send(runMessage(code, runResult.output))
    }
  }, [runCount, runResult, code, send])

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
