---
tags: [negocio, ciclo-de-vida, cliente-360, diseño]
created: 2026-06-03
updated: 2026-06-03
---

# Ciclo de Vida — Vista 360° del Cliente

Diseño de la información y tablas para la sección **Ciclo de vida** (vista 360° del cliente). Basado en prácticas de banca (Customer 360 / Client Lifecycle Management): tenencia de productos a nivel relación, historial de interacciones multicanal, perfil de riesgo/mora, eventos de activación y Next Best Action. Fuentes al final.

## Identidad del cliente

Clave principal: **RFC**. Un RFC puede tener **varios Números de cliente** (por banco/segmento). Estatus global: `Prospecto | Cliente | Inactivo`.

## Bloques de la vista (mapeo a requerimientos)

| # | Bloque UI | Requerimiento | Tabla(s) fuente |
|---|-----------|---------------|-----------------|
| A | Encabezado / línea de vida | Nació como prospecto, fecha conversión, o sigue prospecto | `prospectos`, `clientes` |
| B | Próximo producto recomendado (NBA) | Siguiente producto recomendado | `recomendaciones` |
| C | Números de cliente y cuentas | Todos sus números de cliente y cuentas por producto | `clientes`, `cuentas_productos` |
| D | Ofertas (actuales e históricas) | Ofertas actuales/pasadas + detalle | `ofertas` (ya existe) |
| E | Resumen financiero | Atrasos y saldos | `cuentas_productos`, `saldos` |
| F | Variaciones | Variaciones en cheques y créditos | `variaciones` |
| G | Ingresos no financieros | Ingresos no financieros del cliente | `ingresos_no_financieros` |
| H | Vencimientos | Líneas y contratos por vencer | `cuentas_productos` (fecha_vencimiento) |
| I | Timbrado / activación | ¿Dispuso crédito? ¿prima cobrada? ¿saldo en débito? ¿TPV ≥ 50k? | `timbrado_eventos` |
| J | Mora | Créditos por vencer sin pago / en mora | `cuentas_productos` (dias_mora, pago_al_corriente) |
| K | Aclaraciones / quejas / comentarios | Aclaraciones, quejas, comentarios | `aclaraciones_quejas`, `comentarios` |
| L | Comunicaciones | WhatsApp, SMS, correo, email enviados | `comunicaciones` |
| M | Denuncias | Denuncias presentadas | `denuncias` |
| N | TPV | Afiliaciones y equipos | `tpv_afiliaciones` |
| O | Estatus | Productos cancelados / inactivo | `cuentas_productos.estatus`, `clientes.estatus` |
| P | NPS | Satisfacción / lealtad | `nps` |

## Tablas a simular (esquema)

> Clave de relación: `rfc` en todas; `id_contrato` enlaza productos/saldos/variaciones/timbrado.

### clientes (extiende el seed actual)
`numero_cliente, rfc, nombre, tipo_persona, segmento, banco, fecha_alta, fecha_baja, estatus(Activo|Inactivo), id_prospecto`

### prospectos
`rfc, nombre, tipo_persona, fecha_alta_prospecto, fecha_conversion(null si sigue prospecto), estatus(Prospecto|Convertido|Descartado), origen`

### cuentas_productos (contratos)
`id_contrato, rfc, numero_cliente, familia, producto, numero_cuenta, fecha_alta, fecha_vencimiento, estatus(Activo|Cancelado|Vencido), saldo_actual, saldo_vencido, dias_mora, fecha_proximo_pago, pago_al_corriente(bool), linea_autorizada, linea_disponible`

### saldos (snapshot diario opcional; si no, vive en cuentas_productos)
`id_contrato, fecha_corte, saldo_actual, saldo_vencido, dias_mora`

### variaciones
`id, id_contrato, rfc, tipo(Cheques|Crédito), fecha_movimiento, monto_anterior, monto_actual, monto_movimiento(+ingreso/-egreso)`

### ingresos_no_financieros
Cobros que el banco hace al cliente por **servicios** (ingreso no por intereses).
`rfc, concepto, monto, operaciones, fecha`
Conceptos: **Divisas, Fiduciario, Avalúos, Derivados, Cartas de crédito, Transferencias, Banca Electrónica**.

### timbrado_eventos (activación / "timbrado")
`id, id_contrato, rfc, familia, evento, criterio, cumplido(bool), fecha, monto`
- TDC: dispuso del crédito (uso ≥ umbral)
- Crédito: disposición de la línea
- Seguros: la aseguradora cobró la prima
- Débito: tiene saldo en tarjeta de débito
- TPV: facturó ≥ 50,000
- Nómina: se recibió dispersión

### aclaraciones_quejas
`folio, rfc, tipo(Aclaración|Queja|Comentario), canal, motivo, descripcion, estatus(Abierta|En proceso|Cerrada), resultado, fecha_apertura, fecha_cierre`

### comunicaciones
`id, rfc, canal(WhatsApp|SMS|Correo|Email|Llamada), asunto, contenido, fecha_envio, estatus(Enviado|Entregado|Leído|Fallido), campaña`

### denuncias
`folio, rfc, tipo, autoridad, descripcion, estatus, fecha`

### tpv_afiliaciones
`id, rfc, numero_afiliacion, terminal_id, modelo_equipo, estatus(Activa|Inactiva), facturacion_mensual, fecha_alta`

### recomendaciones (Next Best Action)
`rfc, producto_recomendado, familia, score(0-100), motivo, fecha`

### nps (Net Promoter Score)
`rfc, score(0-10), categoria(Detractor 0-6 | Pasivo 7-8 | Promotor 9-10), fecha, canal, comentario`
NPS global = % Promotores − % Detractores (rango −100 a +100).

## Reglas confirmadas

1. **Timbrado/activación**: TDC = **cualquier disposición/movimiento** · Crédito = dispuso la línea · Seguros = prima cobrada · Cheques/Débito = saldo > 0 · TPV = facturó ≥ $50,000/mes · Nómina = dispersión recibida.
2. **Por vencer**: ≤ 30 días.
3. **Buckets de mora**: Al corriente · 1-29 · 30-59 · 60-89 · 90+ (cartera vencida ≥ 90).
4. **NBA**: regla simple — familia que el cliente no tiene, por prioridad (TDC › Crédito › Seguros › Nómina › TPV › Inversión).
5. **NPS** incluido.

## Datos simulados (generados)

`src/data/ciclo-seed/index.ts` genera **tablas normalizadas** (determinista por RFC) y las cruza. Ver el modelo en [[../tecnico/Ciclo-de-Vida-ERD]].
- Entidad unificada **PERSONAS** (cliente/prospecto). Accesores: `getCiclo360(rfc)`, `listPersonas()`.
- **Prospecto = sin productos contratados** (no contratos/variaciones/timbrado/TPV/ingresos NF/NPS).

> Pendiente: construir la UI del Ciclo de vida (ventana con filtro de cliente/prospecto que consuma `getCiclo360`).

## Fuentes

- [Customer 360 in financial services — Grid Dynamics](https://www.griddynamics.com/blog/revolutionizing-financial-services)
- [Re-Imagine the 360-Degree View of Your Customer — Oracle](https://www.oracle.com/us/industries/financial-services/re-imagine-360-view-customer-br-4466302.pdf)
- [Client Lifecycle Management — nCino](https://www.ncino.com/blog/what-is-client-lifecycle-management)
- [Portal de Queja Electrónica — CONDUSEF](https://tramites.condusef.gob.mx/QuejaElectronica/)
- [Cartera de Crédito — CONDUSEF](https://registros.condusef.gob.mx/reco/cartera_credito_index.php)

## Referencias

- [[Ofertas]] · [[Productos]] · [[../tecnico/Ofertas-Modulo]]
