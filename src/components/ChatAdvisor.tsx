'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { storage, ChatMessage } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { Send, Loader2, Trash2, Globe, MessageCircle, Bot } from 'lucide-react'

interface ChatAdvisorProps {
  isOnline: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', label: 'Yoruba', flag: '🇳🇬' },
] as const

type LangCode = 'en' | 'ig' | 'ha' | 'yo'

const LANG_PROMPTS: Record<LangCode, string> = {
  en: 'Please respond in English.',
  ig: 'Biko zaghachi n\'Igbo. Please respond primarily in Igbo language.',
  ha: 'Don Allah amsa cikin Hausa. Please respond primarily in Hausa language.',
  yo: 'Jọwọ dahun ní èdè Yorùbá. Please respond primarily in Yoruba language.',
}

const QUICK_PROMPTS = [
  'How do I control whitefly on my tomatoes?',
  'My cucumber leaves are turning yellow. What\'s wrong?',
  'Best time to harvest bell peppers in Jos?',
  'How much water does lettuce need daily?',
  'Signs of nitrogen deficiency in crops',
  'How to prevent blight in the rainy season?',
]

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function formatMessageTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatAdvisor({ isOnline }: ChatAdvisorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<LangCode>('en')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = storage.getChatHistory()
    setMessages(saved)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      language,
    }

    const updated = [...messages, userMsg]
    setMessages(updated)
    storage.saveChatMessage(userMsg)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          language_instruction: LANG_PROMPTS[language],
          history: updated.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) throw new Error('API error')
      const data = await response.json()
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        language,
      }
      setMessages(prev => [...prev, assistantMsg])
      storage.saveChatMessage(assistantMsg)
    } catch {
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I could not connect to the advisor server. Please check your internet connection and try again. Your question has been saved.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [messages, language, loading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearHistory = () => {
    storage.clearChatHistory()
    setMessages([])
  }

  const currentLang = LANGUAGES.find(l => l.code === language)!

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-gold-400" />
          <span className="text-sm font-medium">AI Farm Advisor</span>
          <Badge variant="gold" className="text-xs">Claude</Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-accent transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.flag} {currentLang.label}</span>
            </button>
            {showLangPicker && (
              <div className="absolute right-0 top-8 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code as LangCode); setShowLangPicker(false) }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2',
                      language === lang.code && 'text-gold-400 bg-gold-500/10'
                    )}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-muted-foreground hover:text-red-400 p-1 transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-1">AgriDome Advisor</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Ask anything about your greenhouse — pest control, crop care, climate, yields, and more.
                Responds in English, Igbo, Hausa, or Yoruba.
              </p>
            </div>

            {/* Quick prompts */}
            <div>
              <p className="text-xs text-muted-foreground mb-3 text-center">Quick questions</p>
              <div className="flex flex-col gap-2">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={!isOnline}
                    className="text-left text-sm text-foreground/80 hover:text-foreground bg-card border border-border hover:border-gold-500/40 rounded-xl px-4 py-2.5 transition-all disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-gold-400" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-gold-500/15 border border-gold-500/20 text-foreground rounded-br-sm'
                  : 'bg-card border border-border rounded-bl-sm'
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className="text-xs text-muted-foreground/60 mt-1.5 text-right">{formatMessageTime(msg.timestamp)}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-gold-400" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border">
        {!isOnline && (
          <p className="text-xs text-amber-400 text-center mb-2">Chat requires internet connection</p>
        )}
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask in ${currentLang.label}... (Enter to send)`}
            className="flex-1 min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
            disabled={!isOnline || loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || !isOnline}
            variant="gold"
            size="icon"
            className="flex-shrink-0 h-11 w-11"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
