---
tags: [tecnico, ciclo-de-vida, erd, datos]
created: 2026-06-03
updated: 2026-06-03
---

# Ciclo de Vida — Modelo de Datos (ERD)

Tablas normalizadas del ciclo de vida 360°. Generadas en `src/data/ciclo-seed/index.ts` (determinista por RFC) y cruzadas con el seed de Ofertas.

## ERD

```mermaid
erDiagram
    PERSONAS ||--o{ NUMEROS_CLIENTE : "tiene"
    PERSONAS ||--o{ CONTRATOS : "posee"
    PERSONAS ||--o{ OFERTAS : "recibe"
    PERSONAS ||--o{ INGRESOS_NF : "genera cobros"
    PERSONAS ||--o{ ACLARACIONES : "levanta"
    PERSONAS ||--o{ COMUNICACIONES : "recibe"
    PERSONAS ||--o{ DENUNCIAS : "presenta"
    PERSONAS ||--o| RECOMENDACIONES : "NBA"
    PERSONAS ||--o| NPS : "encuesta"
    CONTRATOS ||--o{ VARIACIONES : "movimientos"
    CONTRATOS ||--o| TIMBRADO : "activación"
    CONTRATOS ||--o{ TPV_AFILIACIONES : "terminales"

    PERSONAS {
      string rfc PK
      string nombre
      string tipoPersona
      bool   esCliente
      string estatus "Activo|Inactivo|Prospecto"
      string segmento
      string banco
      bool   nacioComoProspecto
      string fechaAltaProspecto
      string fechaConversion
    }
    NUMEROS_CLIENTE { string rfc FK
      string numeroCliente
      string banco }
    CONTRATOS { string idContrato PK
      string rfc FK
      string numeroCliente
      string familia
      string producto
      string tipo
      string numeroCuenta
      string estatus "Activo|Cancelado|Vencido"
      number lineaAutorizada
      number saldoActual
      number saldoVencido
      number diasMora
      string bucketMora
      string fechaVencimiento
      bool   porVencer
      bool   pagoAlCorriente }
    OFERTAS { string idOferta PK
      string rfc FK
      string tipoOferta
      string etapa
      number monto }
    VARIACIONES { string idContrato FK
      string tipo
      string fecha
      number montoMovimiento }
    INGRESOS_NF { string rfc FK
      string concepto "Divisas|Fiduciario|Avalúos|Derivados|Cartas de crédito|Transferencias|Banca Electrónica"
      number monto
      number operaciones }
    TIMBRADO { string idContrato FK
      string tipo
      string evento
      string criterio
      bool   cumplido
      number monto }
    ACLARACIONES { string folio PK
      string rfc FK
      string tipo "Aclaración|Queja|Comentario"
      string estatus }
    COMUNICACIONES { string rfc FK
      string canal "WhatsApp|SMS|Correo|Email|Llamada"
      string estatus }
    DENUNCIAS { string folio PK
      string rfc FK
      string autoridad
      string estatus }
    TPV_AFILIACIONES { string rfc FK
      string idContrato FK
      string numeroAfiliacion
      string terminalId
      string estatus }
    RECOMENDACIONES { string rfc FK
      string productoRecomendado
      number score }
    NPS { string rfc FK
      number score
      string categoria "Detractor|Pasivo|Promotor" }
```

## Reglas de integridad

- **PERSONAS** unifica cliente y prospecto (`esCliente`). Un **prospecto** NO tiene: `NUMEROS_CLIENTE`, `CONTRATOS`, `VARIACIONES`, `TIMBRADO`, `TPV_AFILIACIONES`, `INGRESOS_NF`, `NPS`. Sí puede tener: `OFERTAS`, `COMUNICACIONES`, `ACLARACIONES`, `RECOMENDACIONES`.
- `VARIACIONES`/`TIMBRADO`/`TPV_AFILIACIONES` cuelgan de `CONTRATOS` (FK `idContrato`).
- `OFERTAS` proviene de [[Ofertas-Modulo|ofertas-seed]] (FK `RFC`).

## API

- `getCiclo360(rfc)` → ensambla la vista (todas las cruzas).
- `listPersonas()` → catálogo para el selector cliente/prospecto.
- Tablas exportadas: `PERSONAS, NUMEROS_CLIENTE, CONTRATOS, VARIACIONES, INGRESOS_NF, TIMBRADO, ACLARACIONES, COMUNICACIONES, DENUNCIAS, TPV, RECOMENDACIONES, NPS_TBL`.

## Vistas (implementadas)

`src/components/ciclo/`:
- **`Ciclo360View`** — renderizador 360° reutilizable (props `rfc`); consume `getCiclo360`. Prospecto oculta bloques de productos.
- **`CicloVidaContainer`** — módulo de barra lateral: lista de clientes/prospectos carterizados (buscador + filtro todos/clientes/prospectos) + detalle 360° del seleccionado. Nav: `ciclo` (App.tsx + Sidebar).

Doble entrada:
1. Barra lateral **Ciclo de vida** → revisar todos los clientes uno por uno.
2. Detalle de oferta → sección **Ciclo de vida** → `Ciclo360View` filtrado por `RFC` de la oferta (cruce con la tabla de ofertas).

## Referencias

- [[../negocio/Ciclo-de-Vida-360]]
- [[Ofertas-Modulo]]
