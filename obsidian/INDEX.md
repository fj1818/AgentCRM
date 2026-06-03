---
tags: [index]
created: 2026-06-02
updated: 2026-06-02
---

# AgentCRM — Vault de Documentación

CRM conversacional bancario. Chat → SQL local (sql.js) → presentación. Ver [[tecnico/Arquitectura]].

## Técnico
- [[tecnico/Arquitectura]] — Visión general y diagrama dual-agent
- [[tecnico/Chat]] — Sistema de chat y modos
- [[tecnico/Base-de-Datos-SQL]] — SQLite en navegador (sql.js)
- [[tecnico/Servicios]] — IA, procedimientos, prospectos, SQL, PDF
- [[tecnico/Catalogo-Funciones]] — Function calling (optimización de tokens)
- [[tecnico/Stores]] — Estado global (Zustand)
- [[tecnico/Componentes]] — Componentes React por dominio
- [[tecnico/Ofertas-Modulo]] — Módulo Ofertas (réplica DiseñoNuevoCRM)
- [[tecnico/Ciclo-de-Vida-ERD]] — Modelo de datos 360° (ERD + tablas)
- [[tecnico/Tipos]] — Interfaces TypeScript
- [[tecnico/Configuracion]] — app/api/tables config

## Reglas de Negocio
- [[negocio/Ofertas]] — Módulo unificado (prospectos + oportunidades)
- [[negocio/Ciclo-de-Vida-360]] — Vista 360° del cliente (diseño + datos)
- [[negocio/Prospectos]] — Ciclo de vida del prospecto
- [[negocio/Clientes]] — Gestión de clientes
- [[negocio/Oportunidades]] — Pipeline de oportunidades
- [[negocio/Productos]] — Familias y productos bancarios
- [[negocio/Cotizaciones]] — Flujo de cotización
- [[negocio/Tareas]] — Agenda y cronograma
- [[negocio/Privacidad-Datos]] — Reglas PII en consultas
- [[negocio/Procedimiento-Contratacion-TDC]] — Procedimiento operativo TDC

## Agentes n8n
- [[agentes-n8n/Agente-Principal]] — Visión general (5 webhooks)
- [[agentes-n8n/Agente-SQL-Generator]] — Genera SQL (Agente 1)
- [[agentes-n8n/Flujo-n8n-Cerebro]] — Diseño del workflow n8n (nodos)
- [[agentes-n8n/Pre-Prompt-Cerebro]] — Prompt: SQL libre + presentación
- [[agentes-n8n/Agente-Presentacion]] — Decide formato (Agente 2)
- [[agentes-n8n/Agente-Procedimientos]] — Guía paso a paso
- [[agentes-n8n/Agente-Prospectos-Oportunidades]] — Crear/actualizar registros
