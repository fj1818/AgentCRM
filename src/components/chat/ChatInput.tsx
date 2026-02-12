/**
 * Input del chat para enviar mensajes
 * Diseño premium con glassmorphism y animaciones
 * Incluye toggle para modo Datos / Procedimientos
 */

import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, Loader2, Database, BookOpen } from 'lucide-react'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'
import { useChatStore, type ChatMode } from '@/stores/chat.store'

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
  const chatMode = useChatStore((s) => s.chatMode)
  const setChatMode = useChatStore((s) => s.setChatMode)

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

  const modes: { key: ChatMode; label: string; icon: typeof Database }[] = [
    { key: 'datos', label: 'Consulta Datos', icon: Database },
    { key: 'procedimientos', label: 'Consulta Procedimientos', icon: BookOpen },
  ]

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
        {/* Toggle de modo */}
        <div className="flex items-center gap-2 mb-3">
          {modes.map(({ key, label, icon: Icon }) => {
            const isActive = chatMode === key
            return (
              <button
                key={key}
                onClick={() => setChatMode(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
                  "transition-all duration-300 transform",
                  isActive
                    ? cn(
                        "scale-[1.02] shadow-lg",
                        isHey
                          ? key === 'datos'
                            ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/40 shadow-cyan-500/15"
                            : "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-400/40 shadow-purple-500/15"
                          : key === 'datos'
                            ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-300 shadow-orange-200/50"
                            : "bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 border border-purple-300 shadow-purple-200/50"
                      )
                    : cn(
                        "hover:scale-[1.01]",
                        isHey
                          ? "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70"
                          : "bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100 hover:text-gray-600"
                      )
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {isActive && (
                  <span className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    isHey
                      ? key === 'datos' ? "bg-cyan-400" : "bg-purple-400"
                      : key === 'datos' ? "bg-orange-500" : "bg-purple-500"
                  )} />
                )}
              </button>
            )
          })}
        </div>

        {/* Contenedor del input con efecto de brillo */}
        <div 
          className={cn(
            "relative rounded-2xl transition-all duration-300",
            isFocused && (isHey 
              ? chatMode === 'datos' 
                ? "ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/10" 
                : "ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/10"
              : chatMode === 'datos'
                ? "ring-2 ring-orange-400/50 shadow-lg shadow-orange-500/10"
                : "ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/10")
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
              placeholder={
                chatMode === 'datos'
                  ? "Escribe tu consulta de datos..."
                  : "Pregunta sobre procedimientos (ej: ¿Cómo contratar TDC?)"
              }
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
                        ? chatMode === 'datos'
                          ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40"
                          : "bg-gradient-to-br from-purple-400 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
                        : chatMode === 'datos'
                          ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
                          : "bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
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
