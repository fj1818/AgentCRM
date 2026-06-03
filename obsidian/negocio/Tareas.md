---
tags: [negocio, tareas, agenda]
created: 2026-06-02
updated: 2026-06-02
---

# Tareas y Agenda

## Definición

Gestión de actividades del ejecutivo: agenda, cronograma diario y reporte de tiempos.

## Componentes

- `tareas/AgendaCalendar` — Vista de calendario
- `tareas/CronogramaDiario` — Plan del día
- `tareas/TimeReportModal` — Reporte de tiempos
- `tareas/AsistenteTareasPanel` — Asistente **local** (sin n8n), homologado al de Ofertas

Estado en [[../tecnico/Stores#eventos-store]] (`eventos.store`).

## Asistente de Agenda (local)

`AsistenteTareasPanel` reemplaza el chat n8n anterior. Chips + texto libre sobre `eventos.store`:
- Crea **tareas/reuniones** con captura guiada por pasos (nombre → fecha → hora → duración). Parser local de fecha (hoy/mañana/día de semana/dd-mm/ISO), hora y duración.
- Consulta: "qué tengo hoy", "pendientes", "reuniones".
- Sin tokens, determinista. El módulo Chat sigue usando n8n para lenguaje libre.

## Referencias

- [[../tecnico/Componentes#tareas]]
- [[../tecnico/Stores]]
