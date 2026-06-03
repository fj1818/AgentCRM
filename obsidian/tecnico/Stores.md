---
tags: [tecnico, store, zustand]
created: 2026-06-02
updated: 2026-06-02
---

# Stores — Estado Global (Zustand)

## chat.store.ts {#chat-store}

Estado del chat conversacional. Ver [[Chat]].

**State:**
- `messages`: Historial de mensajes
- `conversationId`: ID de sesión
- `isLoading`, `error`
- `ultimoGrafico`, `ultimaTabla`: último resultado (compatibilidad)
- `chatMode`: `'datos' | 'procedimientos'`

**Actions:**
- `sendMessage(content)` — Según `chatMode` llama `procesarPregunta` o `procesarPreguntaProcedimiento`; adjunta `grafico`/`tabla`/`tablas` al mensaje del asistente
- `addMessage`, `updateMessageStatus`, `clearMessages`
- `startNewConversation`, `setChatMode`, `setUltimoGrafico`, `setUltimaTabla`, `setError`

**Datos adjuntos al mensaje:** `grafico` (pie/bar/line/column/polar), `tabla` (columnas/filas), `tablas` (multi-tabla).

## crm.store.ts

Estado de datos CRM (prospectos, clientes, oportunidades).

**State:**
- Colecciones de entidades CRM
- Filtros activos
- Entidad seleccionada

## clientes.store.ts

Estado específico de clientes. Maneja la selección y filtrado de clientes.

## eventos.store.ts

Estado de eventos y tareas del calendario/agenda.

## ui.store.ts

Estado de UI: navegación activa, modales abiertos, sidebar collapse.

## Referencias

- [[Servicios]] — Services llamados por los stores
- [[Arquitectura]] — Diagrama de capas
