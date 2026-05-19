/**
 * Contenedor principal del chat
 * Orquesta todos los componentes del chat
 */

import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { useChat } from '@/hooks'

export function ChatContainer() {
  const {
    messages,
    isLoading,
    error,
    messagesEndRef,
    sendMessage,
    clearMessages,
    startNewConversation,
  } = useChat()

  return (
    <div className="flex flex-col h-full bg-surface-900">
      {/* Header del chat */}
      <ChatHeader
        onNewConversation={startNewConversation}
        onClearMessages={clearMessages}
        hasMessages={messages.length > 0}
      />

      {/* Lista de mensajes */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
      />

      {/* Error si existe */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Input del chat */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  )
}


