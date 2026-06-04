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
| `AsistenteOfertasPanel` | Asistente en la tabla: crea ofertas (cliente/prospecto), localiza por **RFC o número de cliente**, responde "qué ofertas tiene" / "en qué campañas está". Chips + texto libre, local sobre el store. |
| `OfertaAgentePanel` | Asistente en el detalle: **actualiza campos** (etapa con valores permitidos, monto) vía solicitudes, y responde dudas del cliente (campañas, otras ofertas). Local sobre el store (`updateOffer`). |
| `asistente.ts` | Lógica compartida: `resolverRfc` (RFC/número), `resumenOfertas`, `campanasDe`, `etapasPermitidas`, `parseEtapa`, `extractMonto`. Respuestas comerciales **sin montos/finanzas**. |

> [!note] Fallback n8n
> Ambos asistentes resuelven acciones **localmente**; lo que el parser no entiende se envía a **n8n** vía `src/services/asistenteN8n.ts` (`preguntarN8n`), con indicador de carga. Webhooks: ofertas→`/Register`, tareas→`/scheduler` (configurables).
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
