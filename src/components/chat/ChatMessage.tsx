/**
 * Componente individual de mensaje
 */

import { Bot, User, AlertCircle } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/utils'
import { formatRelativeTime } from '@/utils/formatting'
import { Avatar } from '@/components/common'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar name="Usuario" size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Contenido del mensaje */}
      <div
        className={cn(
          'flex flex-col max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-primary-600 text-white rounded-tr-md'
              : 'bg-surface-800 text-surface-100 rounded-tl-md',
            isError && 'border border-red-500/50'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Metadata */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1 px-1',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className="text-xs text-surface-500">
            {formatRelativeTime(message.timestamp)}
          </span>
          {isError && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-3 h-3" />
              Error
            </span>
          )}
        </div>

        {/* Contenido estructurado (tablas, gráficos, etc.) */}
        {message.structuredContent && (
          <div className="mt-3 w-full">
            {/* TODO: Renderizar contenido estructurado */}
          </div>
        )}
      </div>
    </div>
  )
}


