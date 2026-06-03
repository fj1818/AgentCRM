---
tags: [tecnico, servicios]
created: 2026-06-02
updated: 2026-06-02
---

# Servicios

Ubicación: `src/services/`. Barrel: `index.ts`.

## aiAssistantService

Núcleo del chat en modo `datos`. Implementa la arquitectura **dual-agent** (ver [[agentes-n8n/Agente-Principal]]).

**Export principal:** `procesarPregunta(pregunta)` → `AIResponse`

**Flujo:**
1. Detecta consultas generativas (estrategia, tablero) → responde local sin SQL.
2. Inicializa [[Base-de-Datos-SQL]].
3. [[agentes-n8n/Agente-SQL-Generator]] genera SQL.
4. Ejecuta SQL local (`ejecutarSQL`).
5. `decidirPresentacionLocal` decide el formato **en código (0 tokens)** según la forma del resultado. El [[agentes-n8n/Agente-Presentacion]] solo se usa si `USAR_AGENTE_PRESENTACION = true` (y recibe solo 3 filas de muestra).
6. `formatearConPresentacion` aplica [[../negocio/Privacidad-Datos|privacidad]] y arma `AIResponse`.

> [!tip] Ahorro en cualquier consulta
> El catálogo de funciones ahorra tokens en consultas conocidas; `decidirPresentacionLocal` ahorra en **todas** (incluido SQL libre) al evitar el Agente 2.

**Otros exports:** `obtenerSugerencias()` (prompts sugeridos), tipo `AIResponse`, `Suggestion`.

## procedimientosAgentService

Chat en modo `procedimientos`. Export: `procesarPreguntaProcedimiento(pregunta)` → `AIResponse`. Webhook `/procedimientos`; con fallback local por palabras clave si falla. Ver [[agentes-n8n/Agente-Procedimientos]].

## prospectosAgentService

Crear/actualizar prospectos y ofertas. Export: `enviarAlAgente(mensaje, sessionId, contexto)` → `AgenteResponse | string`. Webhooks `/prospect` y `/Register`. Ver [[agentes-n8n/Agente-Prospectos-Oportunidades]].

## sqlDatabaseService

SQLite en navegador (sql.js / WASM). Ver [[Base-de-Datos-SQL]].

**Exports:** `inicializarBaseDatos()`, `ejecutarSQL(sql)` → `SQLResult`, `obtenerEsquemaSQL()`, `obtenerDetalleCliente(ide)`.

## cotizadorService

Lógica de cotizaciones del módulo [[../negocio/Cotizaciones]].

## pdfCotizacionService

Genera PDF de cotizaciones con jsPDF + jspdf-autotable.

## chat.service

Helpers de mensajes: `generateMessageId()`, `generateConversationId()`, `createMessage(role, content)`, `formatMessageTime(date)`, `parseAgentResponse()`.

## api.service / webhook.service

> [!warning] Legacy
> `api.service.post()` y `webhook.service.sendMessage()` (con `API_CONFIG` `/webhook/agent-crm`) **no los usa el chat actual**. Quedan de la arquitectura inicial single-webhook.

## Referencias

- [[Arquitectura]]
- [[Stores]]
- [[Base-de-Datos-SQL]]
- [[Chat]]
