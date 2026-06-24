---
tags: [tecnico, heytech, ofertas, tareas]
created: 2026-06-24
updated: 2026-06-24
---

# Hey Tech — Adaptación del CRM

Adaptación del módulo de Ofertas y habilitación del módulo de Tareas (vinculadas a la oferta) para el equipo **Hey Tech** (venta de infraestructura/tecnología). Reutiliza la arquitectura base reconfigurando catálogos y visibilidad de campos. Ver [[tecnico/Ofertas-Modulo]].

## Activación

Se activa con el **tema `hey`** (selector "Banregio ↔ Hey Tech" en el pie del [[tecnico/Componentes|Sidebar]]). El estado vive en `ui.store.ts` (`theme`, `toggleTheme`).

## Cambios por archivo (`src/`)

| Archivo | Cambio |
|---|---|
| `data/ofertas-seed/heytech.ts` | **Nuevo.** Catálogos Hey Tech (`heyCatalogs`), oferta de ejemplo (`heyTechOffer` — Fintech Latam), cliente (`heyTechClient` con País/Giro) y `HEYTECH_OFFER_ID`. |
| `data/ofertas-seed/index.ts` | `Client` ahora incluye `pais?` y `giro?`. |
| `stores/ofertas.store.ts` | Inyecta `heyTechOffer` y `heyTechClient` en el seed. |
| `stores/tareasOferta.store.ts` | **Nuevo.** Store de Tareas vinculadas a la oferta. |
| `components/ofertas/TareasOfertaPanel.tsx` | **Nuevo.** Sección de Tareas dentro del detalle (listado, alta, detalle/edición, cierre). |
| `components/tareas/TareasOfertaLista.tsx` | **Nuevo.** Listado global: "Mis tareas" y "Tareas que asigné" (filtros + salto a la oferta). |
| `components/tareas/TareasContainer.tsx` | Acordeones "Mis tareas" y "Tareas que asigné" sobre la agenda. |
| `components/ofertas/OfertaDetalle.tsx` | Pestaña **Tareas**; campos `heyOnly` (ID, RFC, Prioridad, Monto/Plazo de contratación, Última modificación); oculta campos bancarios y enmascara datos sensibles del cliente; nomenclatura y catálogos propios. |
| `components/layout/Sidebar.tsx` | Selector de equipo/tema (Banregio ↔ Hey Tech). |

## Layout de la oferta en modo Hey Tech

- **Catálogos propios** (`heyCatalogs`): Producto (familia), Plan, Etapa, Estatus (subetapa) y Fuente (origen).
- **Nomenclatura**: Familia de producto→**Producto**, Producto→**Plan**, SubEtapa→**Estatus**, Origen→**Fuente**, Oferta→**Oportunidad**.
- **Campos ocultos** (`bank: true`): Tasa/CAT inicial y de contratación, Montos fijo/revolvente, Monto del timbrado, Número de afiliación, Número de línea, Periodo.
- **Información del cliente/prospecto**: solo Nombre, **RFC**, **País** y **Giro**. Se ocultan Teléfonos, Correo, Dirección, Número de cliente y las acciones de contacto (datos sensibles restringidos).
- **Condiciones de la oferta** (Hey): solo **Monto de la oferta** (el resto se oculta como `bank`).
- **Estilos siguen el tema** (`isHey`), el **layout sigue la oferta** (`heyLayout = isHey || isHeyTechOffer`).
- Se omite la pestaña **Ciclo de vida** (fuera de alcance del MVP Hey Tech).

## Módulo de Tareas (vinculadas a la oferta)

`tareasOferta.store.ts` — `Tarea` siempre ligada a una oferta. Catálogos: `TIPOS_TAREA`, `PRIORIDADES`, `ESTATUS_TAREA`.

Reglas:
1. Toda tarea debe estar vinculada a una oferta existente.
2. **Comentario de cierre obligatorio** al pasar a `Completada` o `Cancelada`.
3. Al cerrar, el comentario se replica como **nota** en la oferta vinculada (`ofertas.store.addComment`).
4. Una tarea cerrada (`Completada`/`Cancelada`) **no puede editarse**.

Funcionalidades en `TareasOfertaPanel`: listado por oferta, alta (T-02), detalle/edición inline (T-03) y cierre con comentario (T-04). Ver [[negocio/Tareas]].

### Listado global (T-01 / T-05)

`TareasOfertaLista` con dos modos (vía selectores del store y `USUARIO_ACTUAL = 'Carlos Mendoza'`):
- **Mis tareas**: `responsable === USUARIO_ACTUAL`.
- **Tareas que asigné**: `asignadoPor === USUARIO_ACTUAL && responsable !== USUARIO_ACTUAL`.

Filtros por estatus y tipo; cada fila salta a la oferta vinculada (`nav.store.abrirOferta`). El campo `asignadoPor` se fija a `USUARIO_ACTUAL` al crear una tarea.
