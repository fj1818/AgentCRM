---
tags: [n8n, agente, sql]
created: 2026-06-02
updated: 2026-06-02
---

# Agente SQL Generator

## Propósito

Traduce preguntas en lenguaje natural a consultas SQL `SELECT` sobre el esquema de [[tecnico/Base-de-Datos-SQL]]. Es el **Agente 1** de la arquitectura dual-agent.

## Webhook

`https://abrahamnavarrete.app.n8n.cloud/webhook/AgentCRMKPI`

## Request

```json
{
  "chatInput": "pregunta del usuario",
  "sessionId": "session-<timestamp>",
  "timestamp": "ISO-8601"
}
```

## Response esperada

```json
{
  "sql": "SELECT ...",
  "explicacion": "Texto",
  "tablas_usadas": ["clientes", "tdc"],
  "tipo_consulta": "agregacion | listado | cruce | tendencia"
}
```

Puede venir envuelta en `{ output: "```json ... ```" }` o como array.

## Reglas

- Solo genera SQL `SELECT` / `WITH` — validado en cliente ([[tecnico/Base-de-Datos-SQL#validación]]).
- El SQL se ejecuta **localmente** en SQLite (sql.js), no en n8n.
- El esquema disponible se obtiene de `obtenerEsquemaSQL()`.

## Casos especiales (cliente)

- Preguntas con "estrategia", "tablero de metas", "sin consultar" → se responden **localmente** sin llamar al agente (contenido generativo en [[tecnico/Servicios#aiassistantservice]]).
- "listado de prospectos" → la pregunta se reescribe para forzar JOIN con ofertas y ocultar IDs.

## Optimización: Function Calling

> [!tip] Recomendado
> En vez de SQL libre, el agente puede devolver `{funcion, params}` del [[../tecnico/Catalogo-Funciones]]. Ahorra tokens y evita el Agente 2. Ver [[Pre-Prompt-Cerebro]].

## Referencias

- [[Agente-Presentacion]] — Agente 2
- [[Pre-Prompt-Cerebro]] — prompt actualizado
- [[../tecnico/Catalogo-Funciones]]
- [[../tecnico/Servicios#aiassistantservice]]
