/**
 * Store para gestión del estado del chat
 * Utiliza Zustand para estado global simple y performante
 */

import { create } from 'zustand'
import type { ChatMessage } from '@/types'
import { chatService, webhookService } from '@/services'

interface ChatState {
  // Estado
  messages: ChatMessage[]
  conversationId: string
  isLoading: boolean
  error: string | null
  
  // Acciones
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: ChatMessage) => void
  updateMessageStatus: (id: string, status: ChatMessage['status']) => void
  clearMessages: () => void
  setError: (error: string | null) => void
  startNewConversation: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Estado inicial
  messages: [],
  conversationId: chatService.generateConversationId(),
  isLoading: false,
  error: null,

  // Enviar mensaje al agente
  sendMessage: async (content: string) => {
    const { conversationId, messages, addMessage, updateMessageStatus, setError } = get()
    
    // Crear mensaje del usuario
    const userMessage = chatService.createMessage('user', content)
    addMessage(userMessage)
    
    set({ isLoading: true, error: null })
    
    try {
      // Construir contexto
      const context = webhookService.buildContext(
        messages.map(m => ({ role: m.role, content: m.content }))
      )
      
      // Enviar al webhook
      const response = await webhookService.sendMessage(content, conversationId, context)
      
      // Marcar mensaje del usuario como enviado
      updateMessageStatus(userMessage.id, 'sent')
      
      if (response) {
        // Crear mensaje del asistente
        const assistantMessage = chatService.createMessage(
          'assistant',
          response.message,
          // TODO: Procesar action para contenido estructurado
        )
        addMessage(assistantMessage)
      } else {
        setError('No se recibió respuesta del agente')
      }
    } catch (error) {
      updateMessageStatus(userMessage.id, 'error')
      setError(error instanceof Error ? error.message : 'Error al enviar mensaje')
    } finally {
      set({ isLoading: false })
    }
  },

  // Agregar mensaje a la lista
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  // Actualizar estado de un mensaje
  updateMessageStatus: (id, status) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, status } : msg
      ),
    }))
  },

  // Limpiar todos los mensajes
  clearMessages: () => {
    set({ messages: [], error: null })
  },

  // Establecer error
  setError: (error) => {
    set({ error })
  },

  // Iniciar nueva conversación
  startNewConversation: () => {
    set({
      messages: [],
      conversationId: chatService.generateConversationId(),
      error: null,
    })
  },
}))

