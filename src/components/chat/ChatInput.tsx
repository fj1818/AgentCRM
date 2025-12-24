/**
 * Input del chat para enviar mensajes
 * Diseño premium con glassmorphism y animaciones
 */

import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }

  const canSend = message.trim() && !isLoading

  return (
    <div 
      className={cn(
        "px-4 py-4 border-t backdrop-blur-xl",
        isHey 
          ? "bg-white/5 border-white/10" 
          : "bg-white/80 border-orange-100"
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* Contenedor del input con efecto de brillo */}
        <div 
          className={cn(
            "relative rounded-2xl transition-all duration-300",
            isFocused && (isHey 
              ? "ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/10" 
              : "ring-2 ring-orange-400/50 shadow-lg shadow-orange-500/10")
          )}
        >
          <div 
            className={cn(
              "flex items-end gap-3 p-2 rounded-2xl border transition-all",
              isHey
                ? "bg-white/10 border-white/20" 
                : "bg-white border-orange-200"
            )}
          >
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Escribe tu pregunta..."
              rows={1}
              disabled={isLoading}
              className={cn(
                "flex-1 resize-none bg-transparent px-4 py-3 text-base",
                "placeholder:text-theme-muted",
                "focus:outline-none",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "min-h-[48px] max-h-[150px]",
                isHey ? "text-white" : "text-gray-800"
              )}
            />

            {/* Botón de enviar con animación */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                "transition-all duration-300 transform",
                canSend
                  ? cn(
                      "hover:scale-105 active:scale-95",
                      isHey 
                        ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40" 
                        : "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
                    )
                  : cn(
                      "cursor-not-allowed",
                      isHey 
                        ? "bg-white/10 text-white/30" 
                        : "bg-gray-100 text-gray-300"
                    )
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Hint */}
        <p 
          className={cn(
            "text-center text-xs mt-3",
            isHey ? "text-white/40" : "text-gray-400"
          )}
        >
          Presiona <kbd className={cn(
            "px-1.5 py-0.5 rounded text-xs font-mono",
            isHey ? "bg-white/10" : "bg-gray-100"
          )}>Enter</kbd> para enviar • <kbd className={cn(
            "px-1.5 py-0.5 rounded text-xs font-mono",
            isHey ? "bg-white/10" : "bg-gray-100"
          )}>Shift+Enter</kbd> para nueva línea
        </p>
      </div>
    </div>
  )
}
