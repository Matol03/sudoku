import type { Difficulty, Puzzle, WorkerResponse } from './types'

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url))
  }
  return worker
}

export function generatePuzzleAsync(difficulty: Difficulty, seed?: number): Promise<Puzzle> {
  return new Promise((resolve, reject) => {
    const w = getWorker()

    const handler = (e: MessageEvent<WorkerResponse>) => {
      w.removeEventListener('message', handler)
      if (e.data.type === 'puzzle' && e.data.puzzle) {
        resolve(e.data.puzzle)
      } else {
        reject(new Error(e.data.error ?? 'Worker failed'))
      }
    }

    w.addEventListener('message', handler)
    w.postMessage({ type: 'generate', difficulty, seed })
  })
}

export function terminateWorker(): void {
  worker?.terminate()
  worker = null
}
