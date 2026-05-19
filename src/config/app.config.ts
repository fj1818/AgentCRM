/**
 * Configuración general de la aplicación
 */

export const APP_CONFIG = {
  name: 'AgentCRM',
  version: '0.1.0',
  description: 'Asistente inteligente para gestión de CRM',
  
  // Configuración del chat
  chat: {
    maxMessagesInContext: 10,
    typingIndicatorDelay: 500,
    messageAnimationDuration: 300,
  },
  
  // Configuración de tablas
  tables: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  
  // Configuración de gráficos
  charts: {
    defaultHeight: 300,
    animationDuration: 500,
  },
} as const

export type AppConfig = typeof APP_CONFIG


