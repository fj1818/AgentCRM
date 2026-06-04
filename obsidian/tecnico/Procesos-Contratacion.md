---
tags: [tecnico, procesos, modulo]
created: 2026-06-03
updated: 2026-06-03
---

# Procesos de contratación

Módulo de barra lateral (`procesos`) con **flash cards** de operaciones. Cada card abre una pantalla (cascarón) del flujo.

`src/components/procesos/ProcesosContainer.tsx`.

## Cards / pantallas

| Card | Pantalla |
|------|----------|
| Onboarding de cuentas | Proceso de onboarding de cuentas |
| Aperturación de líneas | Proceso de aperturación de líneas |
| Contratación de TPV | Proceso de contratación de TPV |
| Contratación de banca electrónica | Proceso de contratación de banca electrónica |
| Renovación de líneas | Proceso de renovación de líneas |
| Contratación de inversiones | Proceso de contratación de inversiones |
| Contratación de nómina | Proceso de contratación de nómina |
| Contratación de seguros | Proceso de contratación de seguros |

Estado local: galería → al hacer clic, pantalla del proceso con botón Volver. Las pantallas son **cascarón** ("Pantalla en construcción — aquí ocurrirá el flujo").

Navegación: ítem `procesos` en `Sidebar` + ruta en `App.tsx`.

## Referencias
- [[Componentes]]
