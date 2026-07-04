import type { ChatMessage } from './lesson.types'

const THREAD_KEY = (lessonId: string) => `maestro:thread:${lessonId}`

type SavedThread = {
  messages: ChatMessage[]
  updatedAt: number
}

export function saveThread(lessonId: string, messages: ChatMessage[]): void {
  try {
    const data: SavedThread = { messages, updatedAt: Date.now() }
    localStorage.setItem(THREAD_KEY(lessonId), JSON.stringify(data))
  } catch {
    // localStorage unavailable (private mode, quota exceeded)
  }
}

export function loadThread(lessonId: string): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(THREAD_KEY(lessonId))
    if (raw === null) return null
    const data = JSON.parse(raw) as SavedThread
    if (!Array.isArray(data.messages)) return null
    return data.messages
  } catch {
    return null
  }
}

export function clearThread(lessonId: string): void {
  try {
    localStorage.removeItem(THREAD_KEY(lessonId))
  } catch {
    // ignore
  }
}
