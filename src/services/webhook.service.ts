/**
 * Servicio para comunicación con el webhook de n8n
 * Maneja el envío de mensajes y recepción de respuestas del agente
 */

import { API_CONFIG } from '@/config'
import { apiService } from './api.service'
import type { WebhookPayload, AgentResponse, ConversationContext } from '@/types'

/**
 * Envía un mensaje al agente a través del webhook de n8n
 */
export async function sendMessageToAgent(
  message: string,
  conversationId: string,
  context?: ConversationContext
): Promise<AgentResponse | null> {
  const payload: WebhookPayload = {
    message,
    conversationId,
    context,
  }

  const response = await apiService.post<AgentResponse>(
    API_CONFIG.webhookUrl,
    payload
  )

  if (!response.success) {
    console.error('Error al enviar mensaje al agente:', response.error)
    return null
  }

  return response.data || null
}

/**
 * Crea el contexto de conversación para enviar al agente
 */
export function buildConversationContext(
  previousMessages: { role: string; content: string }[],
  activeEntity?: { type: string; id: string; data: Record<string, unknown> }
): ConversationContext {
  // Limitar mensajes previos para no exceder límites
  const limitedMessages = previousMessages.slice(-10)

  return {
    previousMessages: limitedMessages,
    activeEntity,
  }
}

/**
 * Servicio de webhook exportado
 */
export const webhookService = {
  sendMessage: sendMessageToAgent,
  buildContext: buildConversationContext,
}

