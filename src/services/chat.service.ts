/**
 * Servicio para gestión del chat
 * Lógica de negocio relacionada con mensajes y conversaciones
 */

import type { ChatMessage, MessageRole, StructuredContent } from '@/types'

/**
 * Genera un ID único para mensajes
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Genera un ID único para conversaciones
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Crea un nuevo mensaje
 */
export function createMessage(
  role: MessageRole,
  content: string,
  structuredContent?: StructuredContent
): ChatMessage {
  return {
    id: generateMessageId(),
    role,
    content,
    timestamp: new Date(),
    status: role === 'user' ? 'sending' : 'sent',
    structuredContent,
  }
}

/**
 * Formatea la marca de tiempo para mostrar
 */
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Parsea la respuesta del agente para extraer contenido estructurado
 */
export function parseAgentResponse(response: string): {
  text: string
  structuredContent?: StructuredContent
} {
  // Por ahora retorna solo texto
  // Se expandirá para detectar JSON con tablas, gráficos, etc.
  return {
    text: response,
  }
}

/**
 * Servicio de chat exportado
 */
export const chatService = {
  generateMessageId,
  generateConversationId,
  createMessage,
  formatMessageTime,
  parseAgentResponse,
}

