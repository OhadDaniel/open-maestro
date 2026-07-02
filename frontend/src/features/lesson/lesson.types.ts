export type ChatRole = 'tutor' | 'student'

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

export type EngineStatus = 'demo' | 'loading' | 'ondevice' | 'unsupported'
