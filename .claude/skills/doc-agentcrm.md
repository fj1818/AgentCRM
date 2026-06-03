# doc-agentcrm

Use this skill after EVERY code change in AgentCRM. Automatically update the Obsidian vault documentation to reflect the change.

## When to trigger

- After creating or modifying any file in `src/`
- After changing any configuration, store, service, or component
- After any n8n-related change (webhook URLs, agent prompts, workflow docs)
- When the user asks to document, update docs, or run `/doc`

## Documentation categories

### 1. Técnico (`obsidian/tecnico/`)
Cover: components, services, stores, hooks, types, utils, config.

For each file or module document:
- **Propósito**: One sentence.
- **API / Props / Exports**: What it exposes.
- **Dependencias**: What it imports / depends on.
- **Notas**: Non-obvious behavior, workarounds, invariants.

Use `[[wikilinks]]` to cross-reference related notes.

### 2. Reglas de Negocio (`obsidian/negocio/`)
Cover: CRM entities (Prospectos, Clientes, Oportunidades, Tareas, Cotizaciones), flows, validations, business logic embedded in the code.

For each entity/flow document:
- **Definición**: What it represents in the business.
- **Estados / Ciclo de vida**: Valid states and transitions.
- **Reglas**: Constraints, validations, calculations.
- **Entidades relacionadas**: `[[wikilinks]]` to other entities.

### 3. Agentes n8n (`obsidian/agentes-n8n/`)
Cover: webhook endpoints, workflow descriptions, agent prompts, tool configurations.

For each agent/workflow document:
- **Nombre y propósito**
- **Webhook URL / trigger**
- **Herramientas del agente** (tools it uses)
- **Prompt del sistema** (if available)
- **Respuestas esperadas**: Format/structure the agent returns
- **Dependencias**: Which n8n nodes or external services

## Process

1. Identify which category the changed code belongs to.
2. Check if a note already exists for that module/entity — update it rather than creating a duplicate.
3. Write/update the note using Obsidian Flavored Markdown (see [[obsidian-markdown]] skill).
4. Update frontmatter `updated` date.
5. Add/update wikilinks to related notes.
6. If new entity: add a link from the index note (`obsidian/INDEX.md`).

## Response format

After documenting, report only:
- Files modified in `src/` (if any)
- Docs updated in `obsidian/` (list note names)

Nothing else. Keep it terse.
