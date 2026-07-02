export type ProviderRole = 'user' | 'assistant'

export type ProviderMessage = {
  role: ProviderRole
  content: string
}

export type ProviderRequest = {
  system: string
  messages: ProviderMessage[]
}

export type ProviderStopReason = 'stop' | 'length' | 'other'

export type TextDeltaEvent = {
  type: 'text_delta'
  text: string
}

export type MessageStopEvent = {
  type: 'message_stop'
  stopReason: ProviderStopReason
}

export type ProviderStreamEvent = TextDeltaEvent | MessageStopEvent
