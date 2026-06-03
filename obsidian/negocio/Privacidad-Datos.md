---
tags: [negocio, privacidad, seguridad]
created: 2026-06-02
updated: 2026-06-02
---

# Reglas de Privacidad de Datos

Aplicadas en `aplicarReglasPrivacidad()` ([[../tecnico/Servicios#aiassistantservice]]) **solo a tablas** antes de mostrarlas. Los gráficos usan datos originales (muestran agregados, no PII).

## Detección de datos financieros

Una columna es financiera si su nombre contiene: `monto`, `saldo`, `valor`, `total`, `credito`, `deuda`, `pago`, o `linea total`.

## Reglas

> [!danger] PII protegida
> Cuando hay datos financieros en el resultado, se **ocultan** las columnas de información personal identificable.

| Situación | Comportamiento |
|-----------|----------------|
| Hay datos financieros | Se mantiene `IDE`; se ocultan nombre, teléfono, celular, dirección, calle, colonia, ciudad, estado, cp, correo/email, rfc |
| No hay datos financieros | Se ocultan TODOS los IDs (`id`, `ide`, `idcliente`, `idpromotor`) |
| Siempre | `id`/`ide` se renombra visualmente a `IDE` |

## Racional de negocio

El IDE es un identificador interno no sensible que permite cruzar montos sin exponer la identidad del cliente. Mostrar montos junto a nombre/RFC violaría las políticas de protección de datos del banco.

## Referencias

- [[../tecnico/Servicios#aiassistantservice]]
- [[../agentes-n8n/Agente-Presentacion]]
- [[../tecnico/Base-de-Datos-SQL]]
