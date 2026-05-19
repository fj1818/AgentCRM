/**
 * Indicador de que el asistente está escribiendo
 * Diseño premium con animación suave
 */

import { Bot } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

export function TypingIndicator() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  return (
    <div className="flex gap-3 message-enter">
      {/* Avatar del bot */}
      <div className="flex-shrink-0">
        <div 
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
            isHey 
              ? "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/25" 
              : "bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/25"
          )}
        >
          <Bot className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Indicador */}
      <div 
        className={cn(
          "rounded-2xl rounded-tl-md px-5 py-4",
          isHey 
            ? "bg-white/10 border border-white/10 backdrop-blur-sm" 
            : "bg-white border border-orange-100"
        )}
      >
        <div className="flex items-center gap-1.5">
          <span 
            className={cn(
              "w-2.5 h-2.5 rounded-full animate-bounce",
              isHey ? "bg-cyan-400" : "bg-orange-400"
            )} 
          />
          <span 
            className={cn(
              "w-2.5 h-2.5 rounded-full animate-bounce",
              isHey ? "bg-cyan-400" : "bg-orange-400"
            )}
            style={{ animationDelay: '0.15s' }}
          />
          <span 
            className={cn(
              "w-2.5 h-2.5 rounded-full animate-bounce",
              isHey ? "bg-cyan-400" : "bg-orange-400"
            )}
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      </div>
    </div>
  )
}


