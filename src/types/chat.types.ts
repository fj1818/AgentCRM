/**
 * Tipos relacionados con el sistema de chat
 */

/** Rol del mensaje en la conversación */
export type MessageRole = 'user' | 'assistant' | 'system'

/** Estado del mensaje */
export type MessageStatus = 'sending' | 'sent' | 'error'

/** Tipo de contenido que puede tener un mensaje */
export type MessageContentType = 'text' | 'table' | 'chart' | 'form' | 'error'

/** Estructura base de un mensaje */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  status: MessageStatus
  /** Contenido estructurado opcional (tablas, gráficos, etc.) */
  structuredContent?: StructuredContent
  /** Tablas múltiples para estrategias de venta */
  tablas?: {
    titulo: string
    columnas: string[]
    datos: Record<string, unknown>[]
  }[]
  /** Gráfico simple generado por el agente */
  grafico?: {
    tipo: 'pie' | 'bar' | 'line' | 'column' | 'polar'
    titulo: string
    datos: { x: string; value: number }[]
  } | null
  /** Tabla simple generada por el agente */
  tabla?: {
    columnas: string[]
    filas: Record<string, unknown>[]
    titulo?: string
    paginate?: boolean
    pageSize?: number
  } | null
}

/** Contenido estructurado que puede acompañar un mensaje */
export interface StructuredContent {
  type: MessageContentType
  data: TableData | ChartData | FormData | null
}

/** Datos de una tabla para mostrar */
export interface TableData {
  headers: string[]
  rows: Record<string, unknown>[]
  totalCount?: number
  page?: number
  pageSize?: number
}

/** Referencia a datos de gráfico (definido en chart.types.ts) */
export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area'
  data: unknown[]
  config: Record<string, unknown>
}

/** Datos de formulario para actualizaciones */
export interface FormData {
  entityType: string
  entityId: string
  fields: FormField[]
}

/** Campo de formulario */
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  value: unknown
  options?: { label: string; value: unknown }[]
  required?: boolean
}

/** Estado de la conversación */
export interface ConversationState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}


