/**
 * Header del chat con acciones
 * Diseño premium con glassmorphism
 */

import { MessageSquarePlus, Trash2, Bot } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

interface ChatHeaderProps {
  onNewConversation: () => void
  onClearMessages: () => void
  hasMessages: boolean
}

export function ChatHeader({
  onNewConversation,
  onClearMessages,
  hasMessages,
}: ChatHeaderProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  return (
    <header 
      className={cn(
        "flex items-center justify-between px-5 py-4",
        "border-b backdrop-blur-xl",
        isHey 
          ? "bg-white/5 border-white/10" 
          : "bg-white/80 border-orange-100"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icono del asistente con gradiente */}
        <div 
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
            isHey 
              ? "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/25" 
              : "bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/25"
          )}
        >
          <Bot className="w-6 h-6 text-white" />
        </div>
        
        <div>
          <h1 
            className={cn(
              "text-lg font-bold",
              isHey ? "text-white" : "text-gray-800"
            )}
          >
            Asistente IA
          </h1>
          <div className="flex items-center gap-2">
            <span 
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isHey ? "bg-green-400" : "bg-green-500"
              )}
            />
            <p 
              className={cn(
                "text-xs font-medium",
                isHey ? "text-white/60" : "text-gray-500"
              )}
            >
              En línea • Listo para ayudarte
            </p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewConversation}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
            "transition-all duration-200",
            isHey
              ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
              : "bg-orange-50 text-orange-600 hover:bg-orange-100"
          )}
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva</span>
        </button>
        
        {hasMessages && (
          <button
            onClick={onClearMessages}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
              "transition-all duration-200",
              isHey
                ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                : "bg-red-50 text-red-500 hover:bg-red-100"
            )}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>
    </header>
  )
}
