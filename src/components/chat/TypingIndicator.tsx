/**
 * Indicador de que el asistente está escribiendo
 */

import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar del bot */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Indicador */}
      <div className="bg-surface-800 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-surface-400 rounded-full animate-typing" />
          <span
            className="w-2 h-2 bg-surface-400 rounded-full animate-typing"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="w-2 h-2 bg-surface-400 rounded-full animate-typing"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  )
}

