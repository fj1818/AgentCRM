# Arquitectura del Proyecto AgentCRM

## Visión General

AgentCRM es un asistente inteligente tipo ChatGPT para gestión de CRM. La arquitectura está diseñada para ser altamente modular, mantenible y escalable.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Bundler**: Vite
- **Estilos**: TailwindCSS
- **Estado Global**: Zustand
- **Gráficos**: Recharts
- **Íconos**: Lucide React
- **Backend/Agente**: Webhook n8n + OpenAI

## Estructura de Carpetas

```
src/
├── components/          # Componentes UI organizados por dominio
│   ├── common/         # Componentes reutilizables (Button, Input, etc.)
│   ├── chat/           # Componentes del sistema de chat
│   ├── charts/         # Componentes de visualización de datos
│   ├── forms/          # Componentes de formularios dinámicos
│   ├── tables/         # Componentes de tablas de datos
│   └── layout/         # Componentes de estructura (Sidebar, Header)
│
├── config/             # Configuración centralizada
│   ├── app.config.ts   # Configuración general de la app
│   ├── api.config.ts   # Configuración de API y webhooks
│   └── tables.config.ts # Definición de tablas del CRM
│
├── hooks/              # Custom hooks de React
│   ├── useChat.ts      # Hook para el sistema de chat
│   ├── useDebounce.ts  # Hook para debounce
│   └── useLocalStorage.ts # Hook para persistencia local
│
├── services/           # Servicios y lógica de negocio
│   ├── api.service.ts  # Cliente HTTP base
│   ├── webhook.service.ts # Comunicación con n8n
│   └── chat.service.ts # Lógica del chat
│
├── stores/             # Estado global con Zustand
│   ├── chat.store.ts   # Estado del chat
│   ├── crm.store.ts    # Estado del CRM
│   └── ui.store.ts     # Estado de la UI
│
├── types/              # Definiciones de TypeScript
│   ├── chat.types.ts   # Tipos del chat
│   ├── crm.types.ts    # Tipos de entidades CRM
│   ├── api.types.ts    # Tipos de API
│   └── chart.types.ts  # Tipos de gráficos
│
├── utils/              # Funciones utilitarias
│   ├── formatting.ts   # Formateo de datos
│   ├── validation.ts   # Validaciones
│   └── helpers.ts      # Helpers generales
│
└── styles/             # Estilos globales
    └── index.css       # Estilos con Tailwind
```

## Principios de Diseño

### 1. Modularidad
- Cada componente tiene una responsabilidad única
- Archivos pequeños y enfocados
- Barrel exports (index.ts) para importaciones limpias

### 2. Separación de Concerns
- **Componentes**: Solo UI y presentación
- **Hooks**: Lógica de componentes
- **Services**: Comunicación externa
- **Stores**: Estado global
- **Utils**: Funciones puras reutilizables

### 3. Type Safety
- TypeScript estricto
- Tipos centralizados en `/types`
- Interfaces bien definidas para todas las estructuras

### 4. Escalabilidad
- Fácil agregar nuevas entidades CRM
- Configuración de tablas declarativa
- Componentes genéricos y reutilizables

## Flujo de Datos

```
Usuario → ChatInput → useChatStore → webhookService → n8n/OpenAI
                                                           ↓
Vista ← ChatMessage ← useChatStore ← AgentResponse ← n8n/OpenAI
```

## Conexión con n8n

El agente se conecta a través de un webhook de n8n:

1. Usuario envía mensaje
2. `webhookService` envía payload al webhook
3. n8n procesa con OpenAI
4. Respuesta incluye texto y posibles acciones
5. UI renderiza respuesta y contenido estructurado

## Próximos Pasos

1. Configurar webhook de n8n
2. Implementar parsing de respuestas del agente
3. Agregar renderizado de contenido estructurado
4. Conectar con datos reales del CRM

