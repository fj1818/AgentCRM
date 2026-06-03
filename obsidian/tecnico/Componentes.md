---
tags: [tecnico, componentes, react]
created: 2026-06-02
updated: 2026-06-02
---

# Componentes

`src/components/`, organizados por dominio. Barrel exports (`index.ts`) por carpeta.

## common
Reutilizables: `Button` (variant/size/isLoading/iconos), `Input`, `Card` (Header/Title/Content/Footer), `Badge`, `Avatar`, `Spinner`, `IconButton`.

## chat
Sistema conversacional. Ver [[Chat]].

## charts
`ChartContainer`, `DynamicChart` (selector por tipo), `BarChartComponent`, `LineChartComponent`, `PieChartComponent`. Recharts + chart.js.

## tables
`DataTable` (genérico, datos `{headers, rows}`), `TableHeader`, `TableRow`, `TablePagination`.

## forms
`DynamicForm` (generado por config de campos), `FormField`, `SelectField`.

## clientes
`ClientesTable`, `ClientDetailsModal`. Ver [[../negocio/Clientes]].

## prospectos
`ProspectosContainer`, `ProspectosTable`, `ProspectosFilters`, `DetalleProspectoModal`. Ver [[../negocio/Prospectos]].

## oportunidades
`OportunidadesContainer`, `OportunidadesTable`, `OportunidadesFilters`, `OportunidadesChatSidebar`, `DetalleOfertaModal`. Ver [[../negocio/Oportunidades]].

## cotizador
`CotizadorContainer`. Ver [[../negocio/Cotizaciones]].

## tareas
`AgendaCalendar`, `CronogramaDiario`, `TimeReportModal`. Ver [[../negocio/Tareas]].

## layout
`AppLayout`, `Sidebar`, `Header`.

## Referencias

- [[Arquitectura]]
- [[Tipos]]
