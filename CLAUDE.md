# AgentCRM — Instrucciones para Claude Code

## Regla principal

**Después de CADA tarea o cambio de código, ejecuta la skill `doc-agentcrm`** para actualizar la documentación en el vault Obsidian (`obsidian/`).

## Respuestas

Sé breve. Solo reporta:
- Resultado de la tarea
- Archivos modificados en `src/`
- Notas actualizadas en `obsidian/`

No expliques qué hiciste ni por qué. No hagas resúmenes largos.

## Vault Obsidian

Ubicación: `obsidian/` en la raíz del proyecto.

Estructura:
- `obsidian/tecnico/` — Componentes, servicios, stores, hooks, tipos
- `obsidian/negocio/` — Entidades CRM, reglas de negocio, flujos
- `obsidian/agentes-n8n/` — Workflows n8n, webhooks, prompts de agentes
- `obsidian/_templates/` — Plantillas de notas
- `obsidian/INDEX.md` — Índice principal del vault

## Stack

- React 18 + TypeScript + Vite
- TailwindCSS + Zustand + Recharts
- n8n (webhook AI agent) + OpenAI
- Obsidian para documentación técnica

## Skills disponibles

- `obsidian-markdown` — Formato Obsidian Flavored Markdown
- `obsidian-cli` — CLI de Obsidian (requiere Obsidian corriendo)
- `doc-agentcrm` — Documenta cambios automáticamente en el vault
