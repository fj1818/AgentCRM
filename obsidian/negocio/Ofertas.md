---
tags: [negocio, ofertas, modulo]
created: 2026-06-03
updated: 2026-06-03
---

# Ofertas (módulo unificado)

Fusiona [[Prospectos]] + [[Oportunidades]] en un solo módulo, con **layout dinámico y permisos por perfil** (recreado de la demo AppScript de DEMOCRM).

## Origen del registro

Cada oferta tiene `origen`:
- `cliente` → proviene de `ofertasclientes` (antes Oportunidades)
- `prospecto` → proviene de `ofertasprospectos` (antes Prospectos)

Unificadas en el tipo `Oferta` por `src/data/ofertasData.ts`.

## Layout dinámico + permisos por perfil

Recrea las hojas del AppScript (CamposSistema, LayoutCampos, PermisosCampoPerfil) como configuración TS. Ver [[../tecnico/Ofertas-Layout-Dinamico]].

**Perfiles:** EJECUTIVO, GERENTE, STAFF (selector en el header, sin login).

Reglas de render:
```
visible  = campo.activo && layout.visibleLayout && permiso.puedeLeer
editable = visible && permiso.puedeEditar
masked   = permiso.mascarar
orden    = layout.orden
```

> [!important]
> Igual que en la demo: el frontend bloquea/oculta, pero al guardar se **revalida el permiso** (`onUpdateCampo` rechaza campos no editables).

## Ciclo de vida

Sección presente como **placeholder** en el detalle (`CicloDeVidaSection`). Contenido por definir.

## Fuera de alcance (no migrado de la demo)

Login/SSO, correo admin, pantallas de administración de configuración.

## Referencias

- [[../tecnico/Ofertas-Layout-Dinamico]]
- [[Prospectos]] · [[Oportunidades]] (entidades base)
- [[Productos]]
