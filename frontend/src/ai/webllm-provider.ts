import type {
  ChatCompletionMessageParam,
  MLCEngineInterface,
} from '@mlc-ai/web-llm'
import type { TutorProvider } from './provider'
import type { ProviderRequest, ProviderStreamEvent } from './provider.types'

export const DEFAULT_WEBLLM_MODEL = 'Qwen3-4B-q4f16_1-MLC'

export type LoadProgress = { progress: number; text: string }

export function isWebGpuAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

const STRONG_MODEL = 'Qwen3-4B-q4f16_1-MLC'
const STANDARD_MODEL = 'Qwen3-4B-q4f16_1-MLC'
const HIGH_MEMORY_GB = 8

export function pickBestModel(): string {
  const device = navigator as Navigator & { deviceMemory?: number }
  const memory = typeof device.deviceMemory === 'number' ? device.deviceMemory : 0
  return memory >= HIGH_MEMORY_GB ? STRONG_MODEL : STANDARD_MODEL
}

function toWebLlmMessages(request: ProviderRequest): ChatCompletionMessageParam[] {
  const system: ChatCompletionMessageParam = {
    role: 'system',
    content: request.system,
  }
  const turns: ChatCompletionMessageParam[] = request.messages.map((message) =>
    message.role === 'assistant'
      ? { role: 'assistant', content: message.content }
      : { role: 'user', content: message.content },
  )
  return [system, ...turns]
}

const SAMPLING = {
  temperature: 0.4,
  top_p: 0.85,
} as const

export class WebLlmProvider implements TutorProvider {
  private readonly engine: MLCEngineInterface

  private constructor(engine: MLCEngineInterface) {
    this.engine = engine
  }

  static async create(
    modelId: string,
    onProgress: (progress: LoadProgress) => void,
  ): Promise<WebLlmProvider> {
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
    const engine = await CreateMLCEngine(modelId, {
      initProgressCallback: (report) =>
        onProgress({ progress: report.progress, text: report.text }),
    })
    return new WebLlmProvider(engine)
  }

  async *streamMessage(
    request: ProviderRequest,
  ): AsyncIterable<ProviderStreamEvent> {
    const stream = await this.engine.chat.completions.create({
      stream: true,
      messages: toWebLlmMessages(request),
      temperature: SAMPLING.temperature,
      top_p: SAMPLING.top_p,
      extra_body: { enable_thinking: false },
    })
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      if (text.length > 0) {
        yield { type: 'text_delta', text }
      }
    }
    yield { type: 'message_stop', stopReason: 'stop' }
  }
}
