export type ChatRole = 'tutor' | 'student'

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  kind?: 'offer-wrap'
  meta?: { goalCount: number }
}

export type EngineStatus = 'demo' | 'loading' | 'ondevice' | 'unsupported'
