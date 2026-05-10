import type { WorkerRequest, WorkerResponse } from './types'
import { generatePuzzle } from './generator'

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { type, difficulty, seed } = e.data
  if (type !== 'generate') return

  try {
    const puzzle = generatePuzzle(difficulty, seed)
    const response: WorkerResponse = { type: 'puzzle', puzzle }
    self.postMessage(response)
  } catch (err) {
    const response: WorkerResponse = {
      type: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    }
    self.postMessage(response)
  }
}
