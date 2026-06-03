---
tags: [tecnico, ofertas, permisos, layout]
created: 2026-06-03
updated: 2026-06-03
---

# Ofertas — Layout dinámico y permisos

Recreación en React/TS de la lógica de la demo AppScript de DEMOCRM (hojas de Google Sheets → configuración TS).

## Archivos

| Archivo | Rol |
|---------|-----|
| `src/types/ofertas.types.ts` | Tipos: `Oferta`, `Perfil`, `CampoSistema`, `LayoutCampo`, `PermisoCampoPerfil`, `CampoCompilado`, `UserAccessContext` |
| `src/config/ofertas.layout.config.ts` | `CAMPOS_SISTEMA`, `LAYOUT_CAMPOS`, permisos por perfil, `buildAccessContext`, `agruparPorSeccion` |
| `src/data/ofertasData.ts` | Une ofertas de clientes + prospectos en `Oferta[]` |
| `src/components/ofertas/` | UI del módulo |

## Campos y secciones (réplica exacta del AppScript)

| Campo (label) | key | Sección | Orden | Tipo |
|---------------|-----|---------|-------|------|
| Cliente | nombre | Datos generales | 1 | Texto |
| RFC | rfc | Datos fiscales | 2 | Texto (sensible) |
| Producto | productoInteres | Datos comerciales | 3 | Texto |
| Monto | monto | Datos comerciales | 4 | Moneda |
| Etapa | etapa | Seguimiento | 5 | Texto |
| Fecha de cierre | fechaCierre | Seguimiento | 6 | Fecha |

## Matriz de permisos (resultado por perfil)

| | EJECUTIVO | GERENTE | STAFF |
|--|-----------|---------|-------|
| Cliente | visible, no edita | visible, no edita | visible, no edita |
| RFC | oculto | visible enmascarado, no edita | oculto |
| Producto | editable | editable | solo lectura |
| Monto | solo lectura | editable | solo lectura |
| Etapa | editable | editable | solo lectura |
| Fecha de cierre | editable | editable | solo lectura |

## Equivalencias con la demo AppScript

| AppScript (Sheet) | Aquí (TS) |
|-------------------|-----------|
| CamposSistema | `CAMPOS_SISTEMA` |
| LayoutCampos | `LAYOUT_CAMPOS` |
| PermisosCampoPerfil | `PERMISOS_OVERRIDE` + default |
| buildUserAccessContext_ | `buildAccessContext(perfil)` |
| updateOpportunityField | `onUpdateCampo` (revalida `editable`) |
| maskValue | `maskValue` en `ofertasFormat.ts` |

## Componentes

- `OfertasContainer` — selector de perfil; **buscador** (nombre/producto/promotor) + filtros (familia, etapa, origen); tabla, modal y chat.
- `OfertasTable` — columnas dinámicas según campos visibles del perfil.
- `OfertaDetailModal` — form por secciones; editable/bloqueado/enmascarado; sección ciclo de vida.
- `CicloDeVidaSection` — placeholder.
- `OfertasChatSidebar` — chat unificado (contexto prospecto/oportunidad); mutaciones a optimizar.

## Cómo cambiar el layout/permisos

Editar `ofertas.layout.config.ts` (activar/ocultar campos, reordenar, permisos por perfil) — sin tocar componentes.

## Referencias

- [[../negocio/Ofertas]]
- [[Componentes]]
