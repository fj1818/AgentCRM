/**
 * Store para gestión del estado del chat
 * Utiliza Zustand para estado global simple y performante
 * Integra con el servicio de IA para respuestas inteligentes
 */

import { create } from 'zustand'
import type { ChatMessage } from '@/types'
import { chatService } from '@/services'
import { procesarPregunta, type AIResponse } from '@/services/aiAssistantService'

interface GraficoData {
  tipo: 'pie' | 'bar' | 'line' | 'column' | 'polar'
  titulo: string
  datos: { x: string; value: number }[]
}

interface TablaData {
  columnas: string[]
  filas: Record<string, unknown>[]
  titulo?: string
}

interface ChatState {
  // Estado
  messages: ChatMessage[]
  conversationId: string
  isLoading: boolean
  error: string | null
  ultimoGrafico: GraficoData | null
  ultimaTabla: TablaData | null
  
  // Acciones
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: ChatMessage) => void
  updateMessageStatus: (id: string, status: ChatMessage['status']) => void
  clearMessages: () => void
  setError: (error: string | null) => void
  startNewConversation: () => void
  setUltimoGrafico: (grafico: GraficoData | null) => void
  setUltimaTabla: (tabla: TablaData | null) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Estado inicial
  messages: [],
  conversationId: chatService.generateConversationId(),
  isLoading: false,
  error: null,
  ultimoGrafico: null,
  ultimaTabla: null,

  // Enviar mensaje al agente de IA
  sendMessage: async (content: string) => {
    const { addMessage, updateMessageStatus, setError, setUltimoGrafico, setUltimaTabla } = get()
    
    // Crear mensaje del usuario
    const userMessage = chatService.createMessage('user', content)
    addMessage(userMessage)
    
    set({ isLoading: true, error: null })
    
    try {
      // Procesar con el servicio de IA
      const response: AIResponse = await procesarPregunta(content)
      
      // Marcar mensaje del usuario como enviado
      updateMessageStatus(userMessage.id, 'sent')
      
      if (response.respuesta) {
        // Crear mensaje del asistente con los datos de resultado
        const assistantMessage = chatService.createMessage(
          'assistant',
          response.respuesta,
        )
        
        // Adjuntar datos de gráfico o tabla al mensaje
        // @ts-expect-error - Extendemos el mensaje con datos adicionales
        assistantMessage.grafico = response.grafico || null
        // @ts-expect-error - Extendemos el mensaje con datos adicionales
        assistantMessage.tabla = response.tabla ? {
          ...response.tabla,
          titulo: response.respuesta,
        } : null
        
        addMessage(assistantMessage)
        
        // También actualizar el estado global para compatibilidad
        if (response.grafico) {
          setUltimoGrafico(response.grafico)
        } else {
          setUltimoGrafico(null)
        }
        
        if (response.tabla) {
          setUltimaTabla({
            ...response.tabla,
            titulo: response.respuesta,
          })
        } else {
          setUltimaTabla(null)
        }
      } else if (response.error) {
        setError(response.error)
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
    set({ messages: [], error: null, ultimoGrafico: null, ultimaTabla: null })
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
      ultimoGrafico: null,
      ultimaTabla: null,
    })
  },

  // Establecer último gráfico
  setUltimoGrafico: (grafico) => {
    set({ ultimoGrafico: grafico })
  },

  // Establecer última tabla
  setUltimaTabla: (tabla) => {
    set({ ultimaTabla: tabla })
  },
}))
