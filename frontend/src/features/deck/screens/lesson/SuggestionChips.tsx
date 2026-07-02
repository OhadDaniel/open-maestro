import { Icon } from '../../../../shared/components/Icon'
import { LESSON_CHAT_COPY } from '../../../lessonchat/lessonchat.constants'

type SuggestionChipsProps = {
  onOpenCode: () => void
  onSuggest: (text: string) => void
}

const CHIP_BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 34,
  padding: '0 15px',
  fontSize: 14,
  borderRadius: '9999px 9999px 0 9999px',
  cursor: 'pointer',
}

export function SuggestionChips({ onOpenCode, onSuggest }: SuggestionChipsProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
      <button type="button" onClick={onOpenCode} style={{ ...CHIP_BASE, gap: 7, fontWeight: 600, background: 'var(--accent)', color: 'var(--ink)', border: 'none' }}>
        <Icon name="code-02" size={16} />
        {LESSON_CHAT_COPY.openCodePanel}
      </button>
      {[LESSON_CHAT_COPY.explainInput, LESSON_CHAT_COPY.showExample].map((label) => (
        <button key={label} type="button" onClick={() => onSuggest(label)} style={{ ...CHIP_BASE, fontWeight: 500, background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border-strong)' }}>
          {label}
        </button>
      ))}
    </div>
  )
}
