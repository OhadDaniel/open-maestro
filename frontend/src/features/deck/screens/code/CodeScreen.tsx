import { useLessonChatContext } from '../../../lessonchat/LessonChatContext'
import { useDeckNav } from '../../DeckContext'
import { ScreenShell } from '../../components/ScreenShell'
import { CodeChatPane } from './CodeChatPane'
import { CodeEditorPane } from './CodeEditorPane'
import { useRunReply } from './useRunReply'

export function CodeScreen() {
  const { goTo } = useDeckNav()
  const { code, setCode, run, running, runResult, hasRun } = useLessonChatContext()
  const showReply = useRunReply(hasRun)

  return (
    <ScreenShell background="var(--surface)">
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <CodeChatPane onBack={() => goTo('lesson')} onFinish={() => goTo('lessondone')} showReply={showReply} />
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
