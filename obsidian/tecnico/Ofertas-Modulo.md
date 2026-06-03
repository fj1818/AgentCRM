---
tags: [tecnico, ofertas, modulo]
created: 2026-06-03
updated: 2026-06-03
---

# Módulo Ofertas (réplica del prototipo DiseñoNuevoCRM)

Réplica del módulo Ofertas del prototipo AppScript `C:\Users\BRM17577\Documents\DiseñoNuevoCRM\prototipo-appscript`. **Sin perfiles/permisos** (eso vivía en la vista de Configuración, fuera de alcance).

## Datos (seed)

CSV originales copiados a `src/data/ofertas-seed/` e importados con `?raw`:
`ofertas, clientes, usuarios, comentarios, familia_producto, productos, campanas, origenes, etapas, subetapas`.

`src/data/ofertas-seed/index.ts` parsea los CSV y reconstruye las estructuras de los servicios `.gs`:
- `buildOffers` ← listOffers (cada oferta con `raw` = todas las columnas)
- `buildClients` ← getClients (mapa por RFC)
- `buildUsers` ← getUsers (`idPromotor = 'PRM'+numero`)
- `buildComments` ← listComments
- `buildCatalogs` ← getCatalogs (families, products, campaigns, productsByFamily, origins, familyRoute, stagesByRoute, subStagesByRoute)

## Estado

`src/stores/ofertas.store.ts` (Zustand) replica los servicios como acciones:
`updateOffer` (cierre por etapa + validación motivo descarte ≥20 + sync nombres), `addComment`, `createClientOffer`, `createProspectOffer`, `reassignOffers`, `searchClients`.

## Componentes (`src/components/ofertas/`)

| Archivo | Rol |
|---------|-----|
| `OfertasContainer` | Buscador + filtros + tabla + paginación (10) + acciones + selección reasignar |
| `OfertasFiltros` | Filtros multiselect en **cascada** (Tipo de persona, Tipo de oferta, Familia, Tipo de producto, Etapa) con niveles L1..Ln |
| `OfertaDetalle` | Overlay (max-w-7xl) con 4 secciones + panel de agente lateral |
| `OfertaAgentePanel` | Chat de agente dentro del detalle; contexto según tipo (Cliente→oportunidades, Prospecto→prospectos); inyecta el ID de oferta como contexto de sistema |
| `NuevaOfertaModal` | Asistente 2 pasos (Cliente: búsqueda + familia / Prospecto: alta + validación RFC) |
| `ReasignarModal` | Reasignación masiva de ejecutivo |
| `ofertasFormat` | money, distinct, conversión de fechas |

## Lista — columnas (idénticas al prototipo)

Ejecutivo · Tipo de oferta (pill Cliente/Prospecto) · Familia de producto · Producto · Etapa · Monto de la oferta · Fecha de cierre · Detalle · Reasignar.

## Detalle — Info de la oferta (5 subsecciones)

Información administrativa · Gestión · Condiciones de la oferta · Condiciones de contratación (oculta) · Descripción. Selects dependientes: Familia→Producto, Etapa→SubEtapa (por ruta del producto).

## Referencias

- [[../negocio/Ofertas]]
- [[Stores]] · [[Componentes]]
