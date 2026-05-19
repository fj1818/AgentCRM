/**
 * Header del chat con acciones
 */

import { MessageSquarePlus, Trash2, Sparkles } from 'lucide-react'
import { IconButton } from '@/components/common'

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
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-surface-700 bg-surface-800/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">AgentCRM</h1>
          <p className="text-xs text-surface-400">Asistente inteligente</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={<MessageSquarePlus className="w-5 h-5" />}
          label="Nueva conversación"
          onClick={onNewConversation}
          size="sm"
        />
        {hasMessages && (
          <IconButton
            icon={<Trash2 className="w-5 h-5" />}
            label="Limpiar mensajes"
            onClick={onClearMessages}
            size="sm"
          />
        )}
      </div>
    </header>
  )
}


