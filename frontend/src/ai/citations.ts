import type { Citation, RetrievedChunk } from './grounding.types'

export function buildCitations(chunks: RetrievedChunk[]): Citation[] {
  return chunks.map((chunk) => ({
    chunkId: chunk.id,
    source: chunk.source,
    text: chunk.text,
  }))
}
