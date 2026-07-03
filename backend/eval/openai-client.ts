import OpenAI from 'openai'

export type RoleModels = { tutor: string; student: string; judge: string; researcher: string }

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_TUTOR_MODEL = 'qwen2.5-coder:3b'
const DEFAULT_LOCAL_MODEL = 'qwen2.5:7b'
const DEFAULT_LOCAL_API_KEY = 'ollama'

const allLocalBaseUrl = process.env.LLM_BASE_URL
const tutorBaseUrl = process.env.TUTOR_BASE_URL ?? allLocalBaseUrl
const openRouterKey = process.env.OPENROUTER_API_KEY
const openaiKey = process.env.OPENAI_API_KEY

const useAllLocal = Boolean(allLocalBaseUrl)
const useLocalTutor = Boolean(tutorBaseUrl)
const useOpenRouter = !useAllLocal && Boolean(openRouterKey)

const requestTimeout = Number(process.env.OPENAI_TIMEOUT_MS)
const timeoutOptions =
  Number.isFinite(requestTimeout) && requestTimeout > 0 ? { timeout: requestTimeout } : {}

const localClient =
  tutorBaseUrl === undefined
    ? null
    : new OpenAI({
        apiKey: process.env.TUTOR_API_KEY ?? DEFAULT_LOCAL_API_KEY,
        baseURL: tutorBaseUrl,
        ...timeoutOptions,
      })

const cloudClient = useAllLocal
  ? null
  : useOpenRouter
    ? new OpenAI({ apiKey: openRouterKey, baseURL: OPENROUTER_BASE_URL, ...timeoutOptions })
    : openaiKey === undefined
      ? null
      : new OpenAI({ apiKey: openaiKey, ...timeoutOptions })

const OPENROUTER_MODELS: RoleModels = {
  tutor: 'qwen/qwen-2.5-coder-32b-instruct',
  student: 'openai/gpt-4o-mini',
  judge: 'anthropic/claude-haiku-4.5',
  researcher: 'anthropic/claude-fable-5',
}

const OPENAI_MODELS: RoleModels = {
  tutor: 'gpt-4o-mini',
  student: 'gpt-5.1-chat-latest',
  judge: 'gpt-4o-mini',
  researcher: 'gpt-5.2-chat-latest',
}

const LOCAL_MODELS: RoleModels = {
  tutor: process.env.TUTOR_MODEL ?? DEFAULT_TUTOR_MODEL,
  student: process.env.STUDENT_MODEL ?? DEFAULT_LOCAL_MODEL,
  judge: process.env.JUDGE_MODEL ?? DEFAULT_LOCAL_MODEL,
  researcher: process.env.RESEARCHER_MODEL ?? DEFAULT_LOCAL_MODEL,
}

const baseModels: RoleModels = useAllLocal
  ? LOCAL_MODELS
  : useOpenRouter
    ? OPENROUTER_MODELS
    : OPENAI_MODELS

export const MODELS: RoleModels =
  useLocalTutor && !useAllLocal
    ? { ...baseModels, tutor: process.env.TUTOR_MODEL ?? DEFAULT_TUTOR_MODEL }
    : baseModels

function clientFor(model: string): OpenAI {
  if (useAllLocal) {
    if (localClient === null) {
      throw new Error('LLM_BASE_URL is set but the local client is unavailable')
    }
    return localClient
  }
  if (localClient !== null && model === MODELS.tutor) {
    return localClient
  }
  if (cloudClient === null) {
    throw new Error('No LLM configured — set LLM_BASE_URL, OPENROUTER_API_KEY, or OPENAI_API_KEY')
  }
  return cloudClient
}

const MAX_TOKENS_CHAT = 512
const MAX_TOKENS_JSON = 12000

function extractJson(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()
  const start = cleaned.search(/[{[]/)
  if (start === -1) {
    return cleaned
  }
  const close = cleaned[start] === '[' ? ']' : '}'
  const end = cleaned.lastIndexOf(close)
  return end > start ? cleaned.slice(start, end + 1) : cleaned
}

function parseJsonLoose(text: string): unknown {
  return JSON.parse(extractJson(text))
}

export async function complete(model: string, system: string, user: string): Promise<string> {
  const response = await clientFor(model).chat.completions.create({
    model,
    max_tokens: MAX_TOKENS_CHAT,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return response.choices[0]?.message?.content ?? ''
}

export async function completeJson(model: string, system: string, user: string): Promise<unknown> {
  const response = await clientFor(model).chat.completions.create({
    model,
    max_tokens: MAX_TOKENS_JSON,
    ...(useOpenRouter || useAllLocal ? {} : { response_format: { type: 'json_object' as const } }),
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return parseJsonLoose(response.choices[0]?.message?.content ?? '{}')
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export async function completeChat(
  model: string,
  system: string,
  turns: ChatTurn[],
): Promise<string> {
  const response = await clientFor(model).chat.completions.create({
    model,
    max_tokens: MAX_TOKENS_CHAT,
    messages: [
      { role: 'system', content: system },
      ...turns.map((turn) =>
        turn.role === 'assistant'
          ? { role: 'assistant' as const, content: turn.content }
          : { role: 'user' as const, content: turn.content },
      ),
    ],
  })
  return response.choices[0]?.message?.content ?? ''
}
