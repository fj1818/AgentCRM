/**
 * Input del chat para enviar mensajes
 */

import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { IconButton } from '@/components/common'
import { cn } from '@/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')
      // Reset altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="border-t border-surface-700 bg-surface-800/50 p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Botón de adjuntar (futuro) */}
        <IconButton
          icon={<Paperclip className="w-5 h-5" />}
          label="Adjuntar archivo"
          size="sm"
          disabled
          className="opacity-50"
        />

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Escribe tu pregunta sobre el CRM..."
            rows={1}
            disabled={isLoading}
            className={cn(
              'w-full resize-none rounded-xl border bg-surface-900 text-white',
              'placeholder:text-surface-400 px-4 py-3 pr-12',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'border-surface-600 hover:border-surface-500',
              'min-h-[48px] max-h-[200px]'
            )}
          />
        </div>

        {/* Botón de enviar */}
        <IconButton
          icon={<Send className="w-5 h-5" />}
          label="Enviar mensaje"
          variant="primary"
          size="md"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className={cn(
            'transition-transform',
            message.trim() && !isLoading && 'hover:scale-105'
          )}
        />
      </div>

      {/* Sugerencia */}
      <p className="text-center text-xs text-surface-500 mt-3">
        Presiona Enter para enviar, Shift+Enter para nueva línea
      </p>
    </div>
  )
}


