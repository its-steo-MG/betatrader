'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SendIcon } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => Promise<void> | void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!message.trim() || disabled || isSending) return
      try {
        setIsSending(true)
        await onSend(message)
        setMessage('')
        inputRef.current?.focus()
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setIsSending(false)
      }
    },
    [message, disabled, isSending, onSend]
  )

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled || isSending}
        className="flex-1 bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40
          shadow-[inset_2px_2px_4px_#e2e8f0] dark:shadow-none"
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled || isSending}
        size="icon"
        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[3px_3px_8px_#0891b2] dark:shadow-none"
      >
        <SendIcon className="h-4 w-4" />
      </Button>
    </form>
  )
}
