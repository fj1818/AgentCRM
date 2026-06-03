/**
 * Componente individual de mensaje
 * Diseño premium con burbujas modernas
 */

import ReactMarkdown from 'react-markdown'
import { Bot, AlertCircle, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/utils'
import { formatRelativeTime } from '@/utils/formatting'
import { useUIStore } from '@/stores'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  return (
    <div
      className={cn(
        'flex gap-3 message-enter',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div 
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
              isHey 
                ? "bg-gradient-to-br from-violet-400 to-purple-600 shadow-violet-500/25" 
                : "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/25"
            )}
          >
            <User className="w-5 h-5 text-white" />
          </div>
        ) : (
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
            'px-5 py-3.5 rounded-2xl shadow-sm',
            isUser
              ? cn(
                  'rounded-tr-md',
                  isHey 
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white' 
                    : 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                )
              : cn(
                  'rounded-tl-md',
                  isHey 
                    ? 'bg-white/10 text-white border border-white/10 backdrop-blur-sm' 
                    : 'bg-white text-gray-800 border border-orange-100'
                ),
            isError && 'border-2 border-red-500/50'
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm leading-relaxed space-y-2">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  h1: ({ children }) => <h1 className="text-base font-bold">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold">{children}</h3>,
                  code: ({ children }) => (
                    <code className="px-1 py-0.5 rounded bg-black/10 text-xs font-mono">{children}</code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1.5 px-1',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span 
            className={cn(
              "text-xs",
              isHey ? "text-white/40" : "text-gray-400"
            )}
          >
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


