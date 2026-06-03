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

- `OfertasContainer` — selector de perfil, filtros, tabla, modal, chat.
- `OfertasTable` — columnas dinámicas según campos visibles del perfil.
- `OfertaDetailModal` — form por secciones; editable/bloqueado/enmascarado; sección ciclo de vida.
- `CicloDeVidaSection` — placeholder.
- `OfertasChatSidebar` — chat unificado (contexto prospecto/oportunidad); mutaciones a optimizar.

## Cómo cambiar el layout/permisos

Editar `ofertas.layout.config.ts` (activar/ocultar campos, reordenar, permisos por perfil) — sin tocar componentes.

## Referencias

- [[../negocio/Ofertas]]
- [[Componentes]]
