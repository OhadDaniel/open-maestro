import { useEffect } from 'react'
import type { TutorProvider } from '../../../../ai/provider'
import { MockTutorProvider } from '../../../../ai/mock-provider'
import { WebLlmProvider, isWebGpuAvailable, pickBestModel } from '../../../../ai/webllm-provider'

export function useProvisionTutor(
  existing: TutorProvider | null,
  setProvider: (provider: TutorProvider) => void,
) {
  useEffect(() => {
    if (existing !== null) {
      return
    }
    let active = true
    const settle = (provider: TutorProvider) => {
      if (active) {
        setProvider(provider)
      }
    }
    if (!isWebGpuAvailable()) {
      settle(new MockTutorProvider())
      return () => {
        active = false
      }
    }
    WebLlmProvider.create(pickBestModel(), () => undefined)
      .then(settle)
      .catch(() => settle(new MockTutorProvider()))
    return () => {
      active = false
    }
  }, [existing, setProvider])
}
