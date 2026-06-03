---
tags: [tecnico, sql, base-de-datos]
created: 2026-06-02
updated: 2026-06-02
---

# Base de Datos SQL (sql.js)

`src/services/sqlDatabaseService.ts`. SQLite compilado a WebAssembly, corre **100% en el navegador**. WASM desde `https://sql.js.org/dist/sql-wasm.wasm`.

## Inicialización

`inicializarBaseDatos()` es idempotente (singleton + `initPromise`). Crea el esquema y carga datos desde `@/data` (import dinámico para evitar dependencias circulares).

## Esquema (tablas)

| Tabla | PK | Notas |
|-------|----|----|
| `clientes` | ide | rfc, nombre, tipoPersona, numeroPromotor; `fechaBaja NULL` = activo |
| `promotores` | numeroPromotor | banco, territorio, region, sucursalEquipo |
| `tdc` | id | producto, lineaTotal/Disponible/Uso |
| `cheques` | id | producto (Nomina*), saldoLinea |
| `tpv` | id | producto, saldoFacturacion |
| `nominas` | id | montoNomina (datos de ejemplo) |
| `creditos` | id | montoCredito, saldoActual (ejemplo) |
| `seguros` | id | numeroPoliza, primaAnual (ejemplo) |
| `variacionescheques` | id | movimientos; montoMovimiento >0 ingreso, <0 egreso |
| `telefonos`, `correos`, `direcciones` | — | contactabilidad cliente (FK ide) |
| `prospectos` | idProspecto | rfc, tipoPersona, fechaConversion, ide |
| `telefonosprospecto`, `correosprospecto`, `direccionesprospecto` | — | contactabilidad prospecto |
| `ofertasprospectos` | idOferta | familiaProducto, etapa, montoInteres |
| `ofertasclientes` | idOferta | montoOferta, montoTimbrado, fechaTimbrado |

Todas las tablas de productos/contactabilidad se relacionan por `ide` con `clientes`. `variacionescheques` ↔ `cheques` por `numeroLinea`.

> [!note]
> `nominas`, `creditos` y `seguros` se generan con datos sintéticos al cargar (no provienen de `@/data`).

## Validación de seguridad {#validación}

`validarSQL()` permite solo `SELECT` y `WITH`. Bloquea `INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE, EXEC, EXECUTE`. La BD es de **solo lectura** para el agente.

## API

- `ejecutarSQL(sql)` → `SQLResult { exito, datos, columnas, total, error?, sql }`
- `obtenerEsquemaSQL()` → string del esquema para el prompt del [[../agentes-n8n/Agente-SQL-Generator]]
- `obtenerDetalleCliente(ide)` → cliente + telefonos + correos + direcciones

## Referencias

- [[Servicios#aiassistantservice]]
- [[../agentes-n8n/Agente-SQL-Generator]]
- [[../negocio/Privacidad-Datos]]
