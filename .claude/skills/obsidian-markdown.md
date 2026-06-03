# obsidian-markdown

Use this skill when creating or editing documentation files in the AgentCRM Obsidian vault (`obsidian/` folder). Apply Obsidian Flavored Markdown conventions.

## Obsidian Markdown Rules

**Wikilinks:** `[[Note Name]]` for internal links. `[[Note Name#Heading]]` for sections. `[[Note Name|Alias]]` for aliases.

**Embeds:** `![[Note Name]]` to embed full notes. `![[image.png|300]]` for sized images.

**Callouts:**
```
> [!note] Title
> Content

> [!warning]
> Content

> [!tip]- Collapsible
> Hidden by default
```

**Properties (frontmatter):**
```yaml
---
tags: [technical, component, store]
aliases: [Alternative Name]
created: 2026-06-02
updated: 2026-06-02
---
```

**Formatting:**
- `==highlighted==` for emphasis
- `%%comment%%` hidden in reading view
- Mermaid diagrams for architecture flows
- `[[Note]]` for cross-references between docs

## Vault Structure

```
obsidian/
├── tecnico/          # Arquitectura, componentes, servicios
├── negocio/          # Reglas de negocio, flujos, entidades
├── agentes-n8n/      # Documentación de workflows n8n
└── _templates/       # Plantillas reutilizables
```

Always use wikilinks `[[]]` to connect related notes. Add frontmatter with tags. Update the `updated` date when modifying existing notes.
