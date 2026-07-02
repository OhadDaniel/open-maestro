import { useState } from 'react'

type UnderlineInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'text' | 'email'
  fontSize?: number
  autoFocus?: boolean
}

export function UnderlineInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  fontSize = 36,
  autoFocus = false,
}: UnderlineInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div>
      <label
        style={{ display: 'block', fontSize: 16, color: 'var(--fg-2)', marginBottom: 12, fontWeight: 500 }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: `2px solid ${focused ? 'var(--accent)' : 'var(--border-strong)'}`,
          color: 'var(--fg)',
          fontFamily: 'var(--display)',
          fontSize,
          fontWeight: 600,
          padding: '6px 2px',
          width: '100%',
          caretColor: 'var(--accent)',
          transition: 'border-color .18s var(--e-productive)',
          outline: 'none',
        }}
      />
    </div>
  )
}
