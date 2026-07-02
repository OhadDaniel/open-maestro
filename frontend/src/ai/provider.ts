import type { ProviderRequest, ProviderStreamEvent } from './provider.types'

export interface TutorProvider {
  streamMessage(request: ProviderRequest): AsyncIterable<ProviderStreamEvent>
}
