/**
 * Tipos para la comunicación con la API y webhooks
 */

/** Respuesta genérica de la API */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ResponseMetadata
}

/** Error de la API */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/** Metadata de respuesta */
export interface ResponseMetadata {
  requestId: string
  timestamp: string
  processingTime?: number
}

/** Payload para enviar al webhook de n8n */
export interface WebhookPayload {
  message: string
  conversationId: string
  context?: ConversationContext
}

/** Contexto de la conversación para el agente */
export interface ConversationContext {
  previousMessages?: { role: string; content: string }[]
  activeEntity?: {
    type: string
    id: string
    data: Record<string, unknown>
  }
  userPreferences?: Record<string, unknown>
}

/** Respuesta del webhook/agente */
export interface AgentResponse {
  message: string
  action?: AgentAction
  data?: unknown
}

/** Acciones que el agente puede solicitar */
export interface AgentAction {
  type: 'show_table' | 'show_chart' | 'show_form' | 'update_record' | 'create_record' | 'delete_record'
  entityType?: string
  payload?: Record<string, unknown>
}

/** Parámetros de consulta para listar entidades */
export interface QueryParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, unknown>
  search?: string
}


