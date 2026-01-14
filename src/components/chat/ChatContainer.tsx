/**
 * Contenedor principal del chat
 * Orquesta todos los componentes del chat con diseño premium
 */

import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { PromptLibrary } from './PromptLibrary'
import { useChat } from '@/hooks'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

export function ChatContainer() {
  const {
    messages,
    isLoading,
    error,
    messagesEndRef,
    sendMessage,
    clearMessages,
    startNewConversation,
    ultimoGrafico,
    ultimaTabla,
  } = useChat()
  
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <div 
      className={cn(
        "flex h-full overflow-hidden", // Added overflow-hidden to prevent body scroll
        isHey 
          ? "bg-gradient-to-b from-[#1a1f2e] via-[#1f2537] to-[#232a3c]" 
          : "bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30"
      )}
    >
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full"> 
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
          ultimoGrafico={ultimoGrafico}
          ultimaTabla={ultimaTabla}
          onSendMessage={sendMessage}
        />

        {/* Error si existe */}
        {error && (
          <div 
            className={cn(
              "px-4 py-3 border-t",
              isHey 
                ? "bg-red-500/10 border-red-500/20" 
                : "bg-red-50 border-red-100"
            )}
          >
            <p 
              className={cn(
                "text-sm",
                isHey ? "text-red-300" : "text-red-600"
              )}
            >
              {error}
            </p>
          </div>
        )}

        {/* Input del chat */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>

      {/* Persistent Prompt Library Sidebar */}
      <PromptLibrary onSelectPrompt={handlePromptSelect} />
    </div>
  )
}
