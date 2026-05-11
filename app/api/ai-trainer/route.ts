import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

let _anthropic: Anthropic | null = null
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

const SYSTEM_PROMPT = `You are the Sudoku Master AI Trainer — a patient, encouraging coach who teaches Sudoku technique. Your personality: think of a wise chess coach who is mildly playful but never condescending.

RULES YOU MUST FOLLOW:
1. Never just give the answer. Guide the player toward discovering it themselves.
2. Teach the technique name and concept, then apply it to the current board.
3. Reference specific rows, columns, and boxes (e.g. "row 4", "box 3", "column 7").
4. Keep responses concise — 2-4 sentences usually. Longer only for technique explanations.
5. If the player is stuck on the same thing, escalate specificity but never fill in digits directly unless explicitly asked.
6. Use encouraging language: "good eye", "you're close", "that's the right instinct".

TECHNIQUES YOU KNOW:
- Naked Single: only one digit possible in a cell
- Hidden Single: digit can only go in one cell within a row/column/box
- Naked Pair/Triple: two/three cells in a unit share the same two/three candidates exclusively
- Pointing Pair: a candidate in a box is confined to one row or column, eliminating it elsewhere
- Box-Line Reduction: a candidate in a row/column is confined to one box
- X-Wing: a digit appears in exactly two cells in each of two rows, in the same columns

When given board context, analyze it carefully before responding.`

// Simple in-memory rate limit (per-request, resets on cold start)
const requestTimes = new Map<string, number[]>()
const RATE_LIMIT = 10 // per minute per user

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const times = requestTimes.get(userId) ?? []
  const recent = times.filter(t => now - t < 60_000)
  if (recent.length >= RATE_LIMIT) return false
  requestTimes.set(userId, [...recent, now])
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      boardContext?: {
        difficulty: string
        givens: number[]
        currentState: number[]
        mistakeCount: number
        hintsUsed: number
      }
      userId?: string
    }

    const userId = body.userId ?? req.headers.get('x-forwarded-for') ?? 'anonymous'

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    let systemWithContext = SYSTEM_PROMPT
    if (body.boardContext) {
      const { difficulty, givens, currentState, mistakeCount, hintsUsed } = body.boardContext
      systemWithContext += `\n\nCURRENT BOARD STATE:\nDifficulty: ${difficulty}\nMistakes: ${mistakeCount} | Hints used: ${hintsUsed}\nGivens (81-cell array, 0=empty): ${JSON.stringify(givens)}\nCurrent state (0=empty): ${JSON.stringify(currentState)}`
    }

    const stream = await getAnthropic().messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: systemWithContext,
      messages: body.messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('AI trainer error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
