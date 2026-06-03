---
tags: [negocio, ofertas, modulo]
created: 2026-06-02
updated: 2026-06-03
---

# Ofertas (módulo unificado)

Réplica del módulo Ofertas del prototipo **DiseñoNuevoCRM** (AppScript). Unifica clientes y prospectos en una sola "Cartera de Ofertas".

## Tipo de oferta

Cada oferta es de tipo **Cliente** o **Prospecto** (`Tipo de oferta`). El alta se hace con el asistente Nueva oferta.

## Lista

Columnas: Ejecutivo, Tipo de oferta, Familia de producto, Producto, Etapa, Monto de la oferta, Fecha de cierre. Con buscador global, filtros multiselect en cascada y paginación. Selección múltiple para **reasignar** ejecutivo.

## Detalle (4 secciones)

1. **Información del cliente** — nombre, teléfonos, correo, dirección, número, RFC (por RFC).
2. **Ciclo de vida** — placeholder (también lo es en el prototipo).
3. **Información de la oferta** — editable en 5 subsecciones; etapas/subetapas dependen de la **ruta** de la familia de producto.
4. **Notas** — comentarios de la oferta + alta de comentario.

## Reglas de negocio (del prototipo)

- Cambio de etapa a **Timbrado** → resultado Ganado (fija Fecha de ganado).
- Cambio a **Descartado** → resultado Perdido; **Motivo de descarte obligatorio (≥20 caracteres)**; fija Fecha de descarte.
- Alta de prospecto: RFC válido por tipo de persona (PF/PFAE 13, PM 12) y al menos un correo o teléfono.

## Fuera de alcance

Perfiles/permisos, Configuración/admin, login.

## Referencias

- [[../tecnico/Ofertas-Modulo]]
- [[Productos]]
