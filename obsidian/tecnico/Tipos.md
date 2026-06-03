---
tags: [tecnico, tipos, typescript]
created: 2026-06-02
updated: 2026-06-02
---

# Tipos TypeScript

`src/types/`. Barrel: `index.ts`.

## Dominio CRM genérico (`crm.types.ts`)
- `CRMEntityType`: contact | company | deal | activity | product | custom
- `CRMEntity` (base), `Contact`, `Company`, `Deal`, `Activity`
- `FieldDefinition`, `TableDefinition` — usados por [[Configuracion]]

> [!note]
> El modelo genérico (Contact/Company/Deal) es la base original; el dominio real bancario usa los tipos específicos siguientes.

## Tipos de dominio bancario
- `cliente.types.ts` — Cliente, tipoPersona
- `prospecto.types.ts` — Prospecto
- `ofertaCliente.types.ts` / `ofertaProspecto.types.ts` — Ofertas
- `productoTDC.types.ts` — Producto TDC
- `promotor.types.ts` — Promotor
- `contactabilidad.types.ts` / `contactabilidadProspecto.types.ts` — Teléfonos, correos, direcciones

## Chat y API
- `chat.types.ts` — `ChatMessage`, `MessageRole`, `StructuredContent`; tipos de mensaje y `grafico`/`tabla`/`tablas`
- `api.types.ts` — `WebhookPayload`, `AgentResponse`, `ConversationContext` (legacy)
- `chart.types.ts` — config de gráficos

## Referencias

- [[Configuracion]]
- [[Componentes]]
- [[Chat]]
