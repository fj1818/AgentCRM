/**
 * Configuración de API y webhooks
 * Aquí se configurará la conexión con n8n
 */

export const API_CONFIG = {
  // URL base del webhook de n8n (se configurará con variable de entorno)
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:5678/webhook/agent-crm',
  
  // Timeout para las peticiones
  timeout: 30000,
  
  // Headers por defecto
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  
  // Reintentos
  retries: {
    max: 3,
    delay: 1000,
  },
} as const

export type ApiConfig = typeof API_CONFIG

/**
 * Variables de entorno requeridas
 * Crear archivo .env con estas variables
 */
export const ENV_VARS = {
  VITE_WEBHOOK_URL: 'URL del webhook de n8n',
  VITE_API_KEY: 'API Key para autenticación (opcional)',
} as const

