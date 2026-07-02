import { useState } from 'react'
import { Icon } from '../../../../shared/components/Icon'
import { LESSON_CHAT_COPY } from '../../../lessonchat/lessonchat.constants'

type ComposerProps = {
  disabled: boolean
  onSend: (text: string) => void
}

export function Composer({ disabled, onSend }: ComposerProps) {
  const [draft, setDraft] = useState('')
  const submit = () => {
    const trimmed = draft.trim()
    if (trimmed.length === 0 || disabled) {
      return
    }
    onSend(trimmed)
    setDraft('')
  }
  return (
    <div style={{ flex: 'none', padding: '14px 30px 20px' }}>
      <div style={{ maxWidth: 660, margin: '0 auto', background: 'var(--surface-muted)', border: '1px solid var(--border-strong)', borderRadius: 16, padding: '6px 8px 8px' }}>
        <input
          value={draft}
          placeholder={LESSON_CHAT_COPY.composerPlaceholder}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
          style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '10px 12px 4px', fontSize: 15, color: 'var(--fg)', fontFamily: 'var(--sans)' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px 2px' }}>
          <button type="button" style={{ width: 32, height: 32, borderRadius: 'var(--r-pill)', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="file-code-01" size={16} />
          </button>
          <div style={{ flex: 1 }} />
          <button type="button" style={{ width: 32, height: 32, borderRadius: 'var(--r-pill)', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="microphone-01" size={16} />
          </button>
          <button type="button" onClick={submit} disabled={disabled} style={{ width: 34, height: 34, borderRadius: 'var(--r-pill)', border: 'none', background: 'var(--fg)', color: '#0A0A0A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
            <Icon name="send-03" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
