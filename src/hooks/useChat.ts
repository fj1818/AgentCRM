/**
 * Hook personalizado para interactuar con el chat
 * Encapsula la lógica del store y provee una API limpia
 */

import { useCallback, useRef, useEffect } from 'react'
import { useChatStore } from '@/stores'

export function useChat() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    startNewConversation,
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Enviar mensaje con validación
  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim()
      if (!trimmedContent || isLoading) return

      await sendMessage(trimmedContent)
    },
    [sendMessage, isLoading]
  )

  // Reintentar último mensaje fallido
  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user' && m.status === 'error')

    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  return {
    messages,
    isLoading,
    error,
    messagesEndRef,
    sendMessage: handleSendMessage,
    clearMessages,
    startNewConversation,
    retryLastMessage,
    hasMessages: messages.length > 0,
  }
}


