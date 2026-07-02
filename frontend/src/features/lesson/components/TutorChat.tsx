import { useState } from 'react'
import { LESSON_LABELS } from '../lesson.constants'
import type { ChatMessage } from '../lesson.types'

type TutorChatProps = {
  messages: ChatMessage[]
  isStreaming: boolean
  onSend: (text: string) => void
}

export function TutorChat({ messages, isStreaming, onSend }: TutorChatProps) {
  const [draft, setDraft] = useState('')

  const submit = () => {
    if (draft.trim().length === 0) {
      return
    }
    onSend(draft)
    setDraft('')
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`bubble bubble-${message.role}`}>
            {message.text.length > 0 ? message.text : LESSON_LABELS.thinking}
          </div>
        ))}
      </div>
      <div className="chat-composer">
        <input
          className="chat-input"
          value={draft}
          placeholder={LESSON_LABELS.placeholder}
          disabled={isStreaming}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit()
            }
          }}
        />
        <button
          className="chat-send"
          type="button"
          disabled={isStreaming}
          onClick={submit}
        >
          {LESSON_LABELS.send}
        </button>
      </div>
    </div>
  )
}
