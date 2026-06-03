---
tags: [tecnico, configuracion]
created: 2026-06-02
updated: 2026-06-02
---

# Configuración

`src/config/`. Barrel: `index.ts`.

## app.config.ts — `APP_CONFIG`
- `name`, `version`, `description`
- `chat`: `maxMessagesInContext` (10), `typingIndicatorDelay` (500), `messageAnimationDuration` (300)
- `tables`: `defaultPageSize` (10), `pageSizeOptions` [10,25,50,100]
- `charts`: `defaultHeight` (300), `animationDuration` (500)

## api.config.ts — `API_CONFIG`
> [!warning] Legacy
> `webhookUrl` (`VITE_WEBHOOK_URL`, default `localhost:5678/webhook/agent-crm`), `timeout` 30s, `retries`. Solo lo usa `webhook.service` legacy. Los webhooks reales están hardcoded en cada servicio de agente. Ver [[../agentes-n8n/Agente-Principal]].

## tables.config.ts — `TABLES_CONFIG`
Definiciones declarativas (`TableDefinition`) para entidades genéricas: `contact`, `company`, `deal`, `activity`. Cada una con `fields` tipados (string/number/date/boolean/select/relation). Alimenta tablas y formularios dinámicos.

## Variables de entorno
- `VITE_WEBHOOK_URL` — webhook legacy (opcional)
- `VITE_API_KEY` — opcional

## Referencias

- [[Tipos]]
- [[Componentes]]
