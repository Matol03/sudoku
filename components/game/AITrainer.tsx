'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Loader2 } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  "What technique applies here?",
  "Why is my last move wrong?",
  "Walk me through the next step.",
  "What should I look for next?",
]

interface AITrainerProps {
  isOpen: boolean
  onClose: () => void
}

export function AITrainer({ isOpen, onClose }: AITrainerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { puzzle, cells, mistakeCount, hintsUsed } = useGameStore()

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) return

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const boardContext = puzzle ? {
        difficulty: puzzle.difficulty,
        givens: puzzle.givens,
        currentState: cells.map(c => c.value),
        mistakeCount,
        hintsUsed,
      } : undefined

      const res = await fetch('/api/ai-trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, boardContext }),
      })

      if (!res.ok) throw new Error('Request failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data) as { text: string }
              accumulated += parsed.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: accumulated }
                return updated
              })
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "I couldn't reach the AI trainer right now. Please check your connection and try again.",
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-sm shadow-2xl"
            style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <Bot size={18} style={{ color: 'var(--accent)' }} />
                <span className="font-display font-semibold" style={{ color: 'var(--text-primary)', fontSize: '15px' }}>
                  AI Trainer
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  Pro
                </span>
              </div>
              <button onClick={onClose} aria-label="Close AI trainer" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <Bot size={32} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Your personal Sudoku coach
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      I can see your board. Ask me anything — I'll teach, not just tell.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {SUGGESTED_PROMPTS.map(p => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="text-left px-3 py-2 rounded-[var(--radius-btn)] text-sm transition-colors"
                        style={{
                          background: 'var(--surface-elevated)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-elevated)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                      borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
                    }}
                  >
                    {msg.content || (isStreaming && i === messages.length - 1 && (
                      <Loader2 size={14} className="animate-spin" />
                    ))}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested chips (after first exchange) */}
            {messages.length > 0 && messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.slice(0, 3).map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                  placeholder="Ask your trainer…"
                  disabled={isStreaming}
                  className="flex-1 px-3 py-2 text-sm rounded-[var(--radius-btn)] outline-none"
                  style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                  className="p-2 rounded-[var(--radius-btn)]"
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    cursor: !input.trim() || isStreaming ? 'not-allowed' : 'pointer',
                    opacity: !input.trim() || isStreaming ? 0.5 : 1,
                  }}
                  aria-label="Send message"
                >
                  {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
