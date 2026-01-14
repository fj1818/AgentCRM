# Documentación Completa del Esquema de Base de Datos - AgenteCRM

## Índice

1. [Estructura General](#estructura-general)
2. [Tablas Principales](#tablas-principales)
3. [Relaciones Entre Tablas](#relaciones-entre-tablas)
4. [Ejemplos de Consultas SQL](#ejemplos-de-consultas-sql)

---

## Estructura General

La base de datos AgenteCRM está construida en SQLite (sql.js) y contiene **15 tablas** organizadas en 4 categorías principales:

### Categorías de Tablas

1. **Clientes y Contactabilidad** (5 tablas)
2. **Productos Financieros** (4 tablas)
3. **Prospectos y Ofertas** (5 tablas)
4. **Promotores** (1 tabla)

---

## Tablas Principales

### 1. CLIENTES

**Tabla central del sistema**

| Campo          | Tipo | Descripción                       | Clave           |
| -------------- | ---- | --------------------------------- | --------------- |
| ide            | TEXT | Identificador único cliente       | PK              |
| rfc            | TEXT | RFC del cliente                   |                 |
| nombre         | TEXT | Nombre o Razón Social             |                 |
| fechaAlta      | TEXT | Fecha de alta en el sistema       |                 |
| fechaBaja      | TEXT | Fecha de baja (NULL = activo)     |                 |
| tipoPersona    | TEXT | Física/Moral/Física con Act. Emp. |                 |
| numeroPromotor | TEXT | Promotor asignado                 | FK → promotores |

**Valores posibles:**

- `tipoPersona`: "Persona Fisica", "Persona Moral", "Persona Fisica con Actividad Empresarial"
- `fechaBaja`: NULL indica cliente activo

---

### 2. PROMOTORES

**Gestión de ejecutivos comerciales**

| Campo          | Tipo    | Descripción                   | Clave |
| -------------- | ------- | ----------------------------- | ----- |
| numeroPromotor | TEXT    | ID único del promotor         | PK    |
| fechaAlta      | TEXT    | Fecha de alta                 |       |
| fechaBaja      | TEXT    | Fecha de baja (NULL = activo) |       |
| activo         | INTEGER | 1 = activo, 0 = inactivo      |       |
| banco          | TEXT    | Nombre del banco              |       |
| territorio     | TEXT    | Territorio asignado           |       |
| region         | TEXT    | Región comercial              |       |
| sucursalEquipo | TEXT    | Sucursal/equipo               |       |

---

### 3. TDC (Tarjetas de Crédito)

**Productos de crédito de clientes**

| Campo           | Tipo    | Descripción                     | Clave         |
| --------------- | ------- | ------------------------------- | ------------- |
| id              | INTEGER | ID autoincremental              | PK            |
| ide             | TEXT    | Cliente propietario             | FK → clientes |
| numeroLinea     | TEXT    | Número de línea/tarjeta         |               |
| fechaAlta       | TEXT    | Fecha de apertura               |               |
| fechaBaja       | TEXT    | Fecha de cierre (NULL = activa) |               |
| producto        | TEXT    | Tipo de tarjeta                 |               |
| lineaTotal      | REAL    | Línea de crédito total ($)      |               |
| lineaDisponible | REAL    | Crédito disponible ($)          |               |
| lineaUso        | REAL    | Crédito utilizado ($)           |               |

**Productos:**

- "Tarjeta Clasica"
- "Tarjeta Gold"
- "Tarjeta Empresarial"

---

### 4. CHEQUES (Cuentas de Nómina)

**Cuentas de depósito de clientes**

| Campo       | Tipo    | Descripción                     | Clave         |
| ----------- | ------- | ------------------------------- | ------------- |
| id          | INTEGER | ID autoincremental              | PK            |
| ide         | TEXT    | Cliente propietario             | FK → clientes |
| numeroLinea | TEXT    | Número de cuenta                |               |
| fechaAlta   | TEXT    | Fecha de apertura               |               |
| fechaBaja   | TEXT    | Fecha de cierre (NULL = activa) |               |
| producto    | TEXT    | Tipo de cuenta                  |               |
| saldoLinea  | REAL    | Saldo actual ($)                |               |

**Productos:**

- "NominaFlex"
- "NominaTradicional"
- "NominaBasica"

**Nota:** Si `fechaBaja` tiene valor, entonces `saldoLinea` = 0

---

### 5. TPV (Terminal Punto de Venta)

**Terminales de cobro para negocios**

| Campo            | Tipo    | Descripción                   | Clave         |
| ---------------- | ------- | ----------------------------- | ------------- |
| id               | INTEGER | ID autoincremental            | PK            |
| ide              | TEXT    | Cliente propietario           | FK → clientes |
| numeroLinea      | TEXT    | Número de terminal            |               |
| fechaAlta        | TEXT    | Fecha de activación           |               |
| fechaBaja        | TEXT    | Fecha de baja (NULL = activa) |               |
| producto         | TEXT    | Tipo de TPV                   |               |
| saldoFacturacion | REAL    | Facturación mensual ($)       |               |

**Productos:**

- "TPV Básico"
- "TPV Plus"
- "TPV Premium"

---

### 6. VARIACIONESCHEQUES

**Movimientos bancarios en cuentas de cheques**

| Campo           | Tipo    | Descripción                   | Clave         |
| --------------- | ------- | ----------------------------- | ------------- |
| id              | INTEGER | ID autoincremental            | PK            |
| ide             | TEXT    | Cliente                       | FK → clientes |
| numeroLinea     | TEXT    | Cuenta afectada               | FK → cheques  |
| fechaMovimiento | TEXT    | Fecha del movimiento          |               |
| montoAnterior   | REAL    | Saldo antes del movimiento    |               |
| montoActual     | REAL    | Saldo después del movimiento  |               |
| montoMovimiento | REAL    | Cantidad (+ingreso / -egreso) |               |

**Interpretación:**

- `montoMovimiento > 0`: Ingreso/depósito
- `montoMovimiento < 0`: Egreso/retiro

---

### 7-9. CONTACTABILIDAD DE CLIENTES

#### TELEFONOS

| Campo    | Tipo    | Descripción        | Clave         |
| -------- | ------- | ------------------ | ------------- |
| id       | INTEGER | ID autoincremental | PK            |
| ide      | TEXT    | Cliente            | FK → clientes |
| telefono | TEXT    | Número telefónico  |               |

#### CORREOS

| Campo  | Tipo    | Descripción        | Clave         |
| ------ | ------- | ------------------ | ------------- |
| id     | INTEGER | ID autoincremental | PK            |
| ide    | TEXT    | Cliente            | FK → clientes |
| correo | TEXT    | Correo electrónico |               |

#### DIRECCIONES

| Campo     | Tipo | Descripción     | Clave            |
| --------- | ---- | --------------- | ---------------- |
| ide       | TEXT | Cliente         | PK/FK → clientes |
| calle     | TEXT | Calle           |                  |
| numero    | TEXT | Número exterior |                  |
| cp        | TEXT | Código postal   |                  |
| colonia   | TEXT | Colonia         |                  |
| municipio | TEXT | Municipio       |                  |
| estado    | TEXT | Estado          |                  |

---

### 10. PROSPECTOS

**Clientes potenciales en prospección**

| Campo           | Tipo | Descripción                   | Clave         |
| --------------- | ---- | ----------------------------- | ------------- |
| idProspecto     | TEXT | ID único del prospecto        | PK            |
| rfc             | TEXT | RFC                           |               |
| tipoPersona     | TEXT | Tipo de persona               |               |
| fechaAlta       | TEXT | Fecha de prospección          |               |
| fechaConversion | TEXT | Fecha de conversión a cliente |               |
| ide             | TEXT | ID cliente (si se convirtió)  | FK → clientes |

---

### 11-13. CONTACTABILIDAD DE PROSPECTOS

#### TELEFONOSPROSPECTO

| Campo       | Tipo    | Clave           |
| ----------- | ------- | --------------- |
| id          | INTEGER | PK              |
| idProspecto | TEXT    | FK → prospectos |
| telefono    | TEXT    |                 |

#### CORREOSPROSPECTO

| Campo       | Tipo    | Clave           |
| ----------- | ------- | --------------- |
| id          | INTEGER | PK              |
| idProspecto | TEXT    | FK → prospectos |
| correo      | TEXT    |                 |

#### DIRECCIONESPROSPECTO

| Campo                                         | Tipo | Clave              |
| --------------------------------------------- | ---- | ------------------ |
| idProspecto                                   | TEXT | PK/FK → prospectos |
| calle, numero, cp, colonia, municipio, estado | TEXT |                    |

---

### 14. OFERTASPROSPECTOS

**Ofertas comerciales para prospectos**

| Campo             | Tipo | Descripción                 | Clave           |
| ----------------- | ---- | --------------------------- | --------------- |
| idOferta          | TEXT | ID único de oferta          | PK              |
| idProspecto       | TEXT | Prospecto objetivo          | FK → prospectos |
| numeroPromotor    | TEXT | Promotor responsable        | FK → promotores |
| familiaProducto   | TEXT | Familia del producto        |                 |
| productoInteres   | TEXT | Producto específico         |                 |
| descripcionOferta | TEXT | Descripción de la oferta    |                 |
| fechaAlta         | TEXT | Fecha de creación           |                 |
| fechaBaja         | TEXT | Fecha de cierre/cancelación |                 |
| etapa             | TEXT | Etapa del pipeline          |                 |
| campaña           | TEXT | Campaña asociada            |                 |
| montoInteres      | REAL | Monto de interés ($)        |                 |
| idOportunidad     | TEXT | Vinculación a oportunidad   |                 |

---

### 15. OFERTASCLIENTES

**Ofertas comerciales para clientes existentes**

| Campo             | Tipo | Descripción                 | Clave           |
| ----------------- | ---- | --------------------------- | --------------- |
| idOferta          | TEXT | ID único de oferta          | PK              |
| ide               | TEXT | Cliente objetivo            | FK → clientes   |
| numeroPromotor    | TEXT | Promotor responsable        | FK → promotores |
| familiaProducto   | TEXT | Familia del producto        |                 |
| productoInteres   | TEXT | Producto específico         |                 |
| descripcionOferta | TEXT | Descripción de la oferta    |                 |
| fechaAlta         | TEXT | Fecha de creación           |                 |
| fechaBaja         | TEXT | Fecha de cierre/cancelación |                 |
| etapa             | TEXT | Etapa del pipeline          |                 |
| campaña           | TEXT | Campaña asociada            |                 |
| montoOferta       | REAL | Monto ofertado ($)          |                 |
| idOportunidad     | TEXT | Vinculación a oportunidad   |                 |
| montoTimbrado     | REAL | Monto formalizado ($)       |                 |
| fechaTimbrado     | TEXT | Fecha de formalización      |                 |

---

## Relaciones Entre Tablas

### Diagrama de Relaciones Principales

```
PROMOTORES (numeroPromotor)
    │
    ├─→ CLIENTES (numeroPromotor FK)
    │       │
    │       ├─→ TDC (ide FK) [1:N]
    │       ├─→ CHEQUES (ide FK) [1:N]
    │       │      └─→ VARIACIONESCHEQUES (numeroLinea FK) [1:N]
    │       ├─→ TPV (ide FK) [1:N]
    │       ├─→ TELEFONOS (ide FK) [1:N]
    │       ├─→ CORREOS (ide FK) [1:N]
    │       ├─→ DIRECCIONES (ide FK) [1:1]
    │       └─→ OFERTASCLIENTES (ide FK) [1:N]
    │
    ├─→ PROSPECTOS (idProspecto)
    │       ├─→ TELEFONOSPROSPECTO (idProspecto FK) [1:N]
    │       ├─→ CORREOSPROSPECTO (idProspecto FK) [1:N]
    │       ├─→ DIRECCIONESPROSPECTO (idProspecto FK) [1:1]
    │       └─→ OFERTASPROSPECTOS (idProspecto FK) [1:N]
    │
    └─→ OFERTAS[CLIENTES|PROSPECTOS] (numeroPromotor FK)
```

### Tipos de Relaciones

#### Uno a Muchos (1:N)

- **Cliente → Productos**: Un cliente puede tener múltiples TDC, Cheques, TPV
- **Cliente → Contacto**: Un cliente puede tener múltiples teléfonos y correos
- **Promotor → Clientes**: Un promotor gestiona múltiples clientes
- **Prospecto → Ofertas**: Un prospecto puede tener múltiples ofertas

#### Uno a Uno (1:1)

- **Cliente → Dirección**: Un cliente tiene una dirección principal
- **Prospecto → Dirección**: Un prospecto tiene una dirección

#### Cruzadas Complejas Posibles

1. **Cliente → Promotor → Región**

   - Permite análisis geográfico de cartera

2. **Cliente → Productos (TDC + Cheques + TPV)**

   - Cross-selling y upselling opportunities

3. **Prospecto → Ofertas → Productos**

   - Análisis de conversión por tipo de producto

4. **Variaciones → Cheques → Cliente → Promotor**

   - Performance financiero por promotor

5. **Ofertas[Clientes|Prospectos] → Promotor → Región**
   - Pipeline comercial por zona geográfica

---

## Ejemplos de Consultas SQL

### 📊 ANÁLISIS DE CLIENTES

#### 1. Distribución de Clientes por Tipo de Persona

```sql
SELECT
    tipoPersona,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clientes), 2) as porcentaje
FROM clientes
WHERE fechaBaja IS NULL
GROUP BY tipoPersona
ORDER BY cantidad DESC;
```

**Gráfico sugerido:** Pie Chart

---

#### 2. Top 10 Clientes por Valor Total de Productos

```sql
SELECT
    c.nombre,
    c.rfc,
    COALESCE(SUM(tdc.lineaTotal), 0) +
    COALESCE(SUM(ch.saldoLinea), 0) +
    COALESCE(SUM(tpv.saldoFacturacion), 0) as valorTotal
FROM clientes c
LEFT JOIN tdc ON c.ide = tdc.ide AND tdc.fechaBaja IS NULL
LEFT JOIN cheques ch ON c.ide = ch.ide AND ch.fechaBaja IS NULL
LEFT JOIN tpv ON c.ide = tpv.ide AND tpv.fechaBaja IS NULL
WHERE c.fechaBaja IS NULL
GROUP BY c.ide, c.nombre, c.rfc
ORDER BY valorTotal DESC
LIMIT 10;
```

**Gráfico sugerido:** Bar Chart
**Tabla:** Sí, con formato de moneda

---

#### 3. Clientes Activos vs Inactivos

```sql
SELECT
    CASE
        WHEN fechaBaja IS NULL THEN 'Activos'
        ELSE 'Inactivos'
    END as estado,
    COUNT(*) as cantidad
FROM clientes
GROUP BY estado;
```

**Gráfico sugerido:** Pie Chart

---

### 💳 ANÁLISIS DE PRODUCTOS

#### 4. Distribución de TDC por Tipo de Producto

```sql
SELECT
    producto,
    COUNT(*) as cantidad,
    ROUND(AVG(lineaTotal), 2) as lineaPromedio,
    SUM(lineaTotal) as lineaTotal,
    SUM(lineaDisponible) as disponibleTotal,
    SUM(lineaUso) as usoTotal
FROM tdc
WHERE fechaBaja IS NULL
GROUP BY producto
ORDER BY cantidad DESC;
```

**Gráfico sugerido:** Column Chart (cantidad por producto)

---

#### 5. Utilización de Líneas de Crédito

```sql
SELECT
    c.nombre,
    tdc.producto,
    tdc.lineaTotal,
    tdc.lineaUso,
    ROUND((tdc.lineaUso * 100.0 / NULLIF(tdc.lineaTotal, 0)), 2) as porcentajeUso
FROM tdc
JOIN clientes c ON tdc.ide = c.ide
WHERE tdc.fechaBaja IS NULL
  AND tdc.lineaTotal > 0
ORDER BY porcentajeUso DESC
LIMIT 20;
```

**Tabla:** Sí
**Alerta:** Clientes con utilización > 80% para riesgo

---

#### 6. Productos por Cliente (Cross-Selling)

```sql
SELECT
    c.nombre,
    COUNT(DISTINCT tdc.id) as numTDC,
    COUNT(DISTINCT ch.id) as numCheques,
    COUNT(DISTINCT tpv.id) as numTPV,
    (COUNT(DISTINCT tdc.id) + COUNT(DISTINCT ch.id) + COUNT(DISTINCT tpv.id)) as totalProductos
FROM clientes c
LEFT JOIN tdc ON c.ide = tdc.ide AND tdc.fechaBaja IS NULL
LEFT JOIN cheques ch ON c.ide = ch.ide AND ch.fechaBaja IS NULL
LEFT JOIN tpv ON c.ide = tpv.ide AND tpv.fechaBaja IS NULL
WHERE c.fechaBaja IS NULL
GROUP BY c.ide, c.nombre
HAVING totalProductos > 0
ORDER BY totalProductos DESC
LIMIT 15;
```

**Tabla:** Sí
**Insight:** Identificar clientes con un solo producto para oportunidades de venta cruzada

---

### 💰 ANÁLISIS FINANCIERO

#### 7. Top 10 Variaciones Positivas del Mes

```sql
SELECT
    c.nombre,
    v.fechaMovimiento,
    v.montoMovimiento,
    v.montoActual,
    ch.producto
FROM variacionescheques v
JOIN clientes c ON v.ide = c.ide
JOIN cheques ch ON v.numeroLinea = ch.numeroLinea
WHERE v.montoMovimiento > 0
  AND DATE(v.fechaMovimiento) >= DATE('now', '-30 days')
ORDER BY v.montoMovimiento DESC
LIMIT 10;
```

**Gráfico sugerido:** Bar Chart

---

#### 8. Top 10 Variaciones Negativas del Mes

```sql
SELECT
    c.nombre,
    v.fechaMovimiento,
    v.montoMovimiento,
    v.montoActual,
    ch.producto
FROM variacionescheques v
JOIN clientes c ON v.ide = c.ide
JOIN cheques ch ON v.numeroLinea = ch.numeroLinea
WHERE v.montoMovimiento < 0
  AND DATE(v.fechaMovimiento) >= DATE('now', '-30 days')
ORDER BY v.montoMovimiento ASC
LIMIT 10;
```

**Gráfico sugerido:** Bar Chart (valores absolutos)

---

#### 9. Clientes con Mayor Facturación TPV

```sql
SELECT
    c.nombre,
    c.rfc,
    tpv.producto,
    SUM(tpv.saldoFacturacion) as facturacionTotal
FROM tpv
JOIN clientes c ON tpv.ide = c.ide
WHERE tpv.fechaBaja IS NULL
GROUP BY c.ide, c.nombre, c.rfc, tpv.producto
ORDER BY facturacionTotal DESC
LIMIT 10;
```

**Gráfico sugerido:** Bar Chart

---

### 👥 ANÁLISIS DE PROMOTORES

#### 10. Cartera de Clientes por Promotor

```sql
SELECT
    p.numeroPromotor,
    p.banco,
    p.region,
    COUNT(DISTINCT c.ide) as numClientes,
    COUNT(DISTINCT CASE WHEN c.fechaBaja IS NULL THEN c.ide END) as clientesActivos
FROM promotores p
LEFT JOIN clientes c ON p.numeroPromotor = c.numeroPromotor
WHERE p.activo = 1
GROUP BY p.numeroPromotor, p.banco, p.region
ORDER BY clientesActivos DESC;
```

**Gráfico sugerido:** Bar Chart

---

#### 11. Valor de Cartera por Promotor

```sql
SELECT
    p.numeroPromotor,
    p.region,
    COUNT(DISTINCT c.ide) as numClientes,
    SUM(COALESCE(tdc.lineaTotal, 0)) +
    SUM(COALESCE(ch.saldoLinea, 0)) +
    SUM(COALESCE(tpv.saldoFacturacion, 0)) as valorCartera
FROM promotores p
JOIN clientes c ON p.numeroPromotor = c.numeroPromotor
LEFT JOIN tdc ON c.ide = tdc.ide AND tdc.fechaBaja IS NULL
LEFT JOIN cheques ch ON c.ide = ch.ide AND ch.fechaBaja IS NULL
LEFT JOIN tpv ON c.ide = tpv.ide AND tpv.fechaBaja IS NULL
WHERE p.activo = 1 AND c.fechaBaja IS NULL
GROUP BY p.numeroPromotor, p.region
ORDER BY valorCartera DESC;
```

**Gráfico sugerido:** Bar Chart
**Tabla:** Sí

---

### 🎯 ANÁLISIS DE PROSPECTOS Y OFERTAS

#### 12. Prospectos Activos por Familia de Producto

```sql
SELECT
    op.familiaProducto,
    COUNT(DISTINCT op.idProspecto) as numProspectos,
    SUM(op.montoInteres) as montoTotal,
    ROUND(AVG(op.montoInteres), 2) as montoPromedio
FROM ofertasprospectos op
WHERE op.fechaBaja IS NULL
GROUP BY op.familiaProducto
ORDER BY montoTotal DESC;
```

**Gráfico sugerido:** Column Chart

---

#### 13. Pipeline de Ventas por Etapa

```sql
SELECT
    etapa,
    COUNT(*) as cantidad,
    SUM(montoOferta) as valorTotal
FROM ofertasclientes
WHERE fechaBaja IS NULL
GROUP BY etapa
ORDER BY
    CASE etapa
        WHEN 'Prospección' THEN 1
        WHEN 'Calificación' THEN 2
        WHEN 'Propuesta' THEN 3
        WHEN 'Negociación' THEN 4
        WHEN 'Cierre' THEN 5
    END;
```

**Gráfico sugerido:** Funnel Chart o Column Chart

---

#### 14. Tasa de Conversión de Prospectos

```sql
SELECT
    COUNT(DISTINCT idProspecto) as totalProspectos,
    COUNT(DISTINCT CASE WHEN fechaConversion IS NOT NULL THEN idProspecto END) as convertidos,
    ROUND(COUNT(DISTINCT CASE WHEN fechaConversion IS NOT NULL THEN idProspecto END) * 100.0 /
          COUNT(DISTINCT idProspecto), 2) as tasaConversion
FROM prospectos;
```

**Gráfico sugerido:** Pie Chart (Convertidos vs No Convertidos)

---

#### 15. Ofertas Timbradas vs No Timbradas

```sql
SELECT
    CASE
        WHEN fechaTimbrado IS NOT NULL THEN 'Timbradas'
        ELSE 'Pendientes'
    END as estado,
    COUNT(*) as cantidad,
    SUM(montoOferta) as montoTotal
FROM ofertasclientes
WHERE fechaBaja IS NULL
GROUP BY estado;
```

**Gráfico sugerido:** Pie Chart

---

### 🗺️ ANÁLISIS GEOGRÁFICO

#### 16. Distribución de Clientes por Estado

```sql
SELECT
    d.estado,
    COUNT(DISTINCT c.ide) as numClientes
FROM direcciones d
JOIN clientes c ON d.ide = c.ide
WHERE c.fechaBaja IS NULL
GROUP BY d.estado
ORDER BY numClientes DESC;
```

**Gráfico sugerido:** Bar Chart

---

#### 17. Concentración de Cartera por Región

```sql
SELECT
    p.region,
    COUNT(DISTINCT c.ide) as numClientes,
    SUM(COALESCE(tdc.lineaTotal, 0)) as valorTDC,
    SUM(COALESCE(ch.saldoLinea, 0)) as valorCheques,
    SUM(COALESCE(tpv.saldoFacturacion, 0)) as valorTPV
FROM promotores p
JOIN clientes c ON p.numeroPromotor = c.numeroPromotor
LEFT JOIN tdc ON c.ide = tdc.ide AND tdc.fechaBaja IS NULL
LEFT JOIN cheques ch ON c.ide = ch.ide AND ch.fechaBaja IS NULL
LEFT JOIN tpv ON c.ide = tpv.ide AND tpv.fechaBaja IS NULL
WHERE c.fechaBaja IS NULL
GROUP BY p.region
ORDER BY numClientes DESC;
```

**Gráfico sugerido:** Stacked Bar Chart

---

### 📈 TENDENCIAS Y ANÁLISIS TEMPORAL

#### 18. Altas de Clientes por Mes (Últimos 12 meses)

```sql
SELECT
    STRFTIME('%Y-%m', fechaAlta) as mes,
    COUNT(*) as altasNuevas
FROM clientes
WHERE DATE(fechaAlta) >= DATE('now', '-12 months')
GROUP BY mes
ORDER BY mes;
```

**Gráfico sugerido:** Line Chart

---

#### 19. Flujo de Efectivo Mensual (Variaciones)

```sql
SELECT
    STRFTIME('%Y-%m', fechaMovimiento) as mes,
    SUM(CASE WHEN montoMovimiento > 0 THEN montoMovimiento ELSE 0 END) as ingresos,
    ABS(SUM(CASE WHEN montoMovimiento < 0 THEN montoMovimiento ELSE 0 END)) as egresos,
    SUM(montoMovimiento) as neto
FROM variacionescheques
WHERE DATE(fechaMovimiento) >= DATE('now', '-12 months')
GROUP BY mes
ORDER BY mes;
```

**Gráfico sugerido:** Line Chart (múltiples series)

---

### 🔍 ANÁLISIS DE RIESGO Y OPORTUNIDADES

#### 20. Clientes en Riesgo (Disminución de Saldos)

```sql
WITH SaldosActuales AS (
    SELECT
        c.ide,
        c.nombre,
        SUM(ch.saldoLinea) as saldoActual
    FROM clientes c
    JOIN cheques ch ON c.ide = ch.ide
    WHERE ch.fechaBaja IS NULL
    GROUP BY c.ide, c.nombre
),
SaldosHistoricos AS (
    SELECT
        v.ide,
        AVG(v.montoAnterior) as saldoPromedio
    FROM variacionescheques v
    WHERE DATE(v.fechaMovimiento) >= DATE('now', '-90 days')
    GROUP BY v.ide
)
SELECT
    sa.nombre,
    sa.saldoActual,
    sh.saldoPromedio,
    ROUND(((sa.saldoActual - sh.saldoPromedio) / NULLIF(sh.saldoPromedio, 0)) * 100, 2) as porcentajeCambio
FROM SaldosActuales sa
JOIN SaldosHistoricos sh ON sa.ide = sh.ide
WHERE porcentajeCambio < -20
ORDER BY porcentajeCambio ASC;
```

**Tabla:** Sí
**Alerta:** Clientes con caída >20% requieren atención

---

#### 21. Oportunidades de Cross-Selling

```sql
SELECT
    c.nombre,
    c.rfc,
    CASE
        WHEN COUNT(DISTINCT tdc.id) = 0 THEN 'TDC'
        WHEN COUNT(DISTINCT ch.id) = 0 THEN 'Cuenta Nómina'
        WHEN COUNT(DISTINCT tpv.id) = 0 THEN 'TPV'
    END as productoPendiente
FROM clientes c
LEFT JOIN tdc ON c.ide = tdc.ide AND tdc.fechaBaja IS NULL
LEFT JOIN cheques ch ON c.ide = ch.ide AND ch.fechaBaja IS NULL
LEFT JOIN tpv ON c.ide = tpv.ide AND tpv.fechaBaja IS NULL
WHERE c.fechaBaja IS NULL
  AND (COUNT(DISTINCT tdc.id) = 0
       OR COUNT(DISTINCT ch.id) = 0
       OR COUNT(DISTINCT tpv.id) = 0)
GROUP BY c.ide, c.nombre, c.rfc
LIMIT 20;
```

**Tabla:** Sí
**Insight:** Lista de clientes con productos faltantes

---

### 📊 REPORTES EJECUTIVOS

#### 22. Resumen Ejecutivo de Portafolio

```sql
SELECT
    'Clientes Activos' as metrica,
    COUNT(*) as valor
FROM clientes WHERE fechaBaja IS NULL
UNION ALL
SELECT
    'TDC Activas',
    COUNT(*)
FROM tdc WHERE fechaBaja IS NULL
UNION ALL
SELECT
    'Valor Total TDC',
    ROUND(SUM(lineaTotal), 0)
FROM tdc WHERE fechaBaja IS NULL
UNION ALL
SELECT
    'Saldo Total Cuentas',
    ROUND(SUM(saldoLinea), 0)
FROM cheques WHERE fechaBaja IS NULL
UNION ALL
SELECT
    'Facturación Total TPV',
    ROUND(SUM(saldoFacturacion), 0)
FROM tpv WHERE fechaBaja IS NULL;
```

**Tabla:** Sí (formato KPI dashboard)

---

#### 23. Performance de Promotores (Ranking)

```sql
SELECT
    p.numeroPromotor,
    p.region,
    COUNT(DISTINCT c.ide) as clientesActivos,
    COUNT(DISTINCT oc.idOferta) as ofertasActivas,
    SUM(oc.montoOferta) as valorPipeline,
    SUM(CASE WHEN oc.fechaTimbrado IS NOT NULL THEN oc.montoTimbrado ELSE 0 END) as ventasCerradas
FROM promotores p
LEFT JOIN clientes c ON p.numeroPromotor = c.numeroPromotor AND c.fechaBaja IS NULL
LEFT JOIN ofertasclientes oc ON p.numeroPromotor = oc.numeroPromotor AND oc.fechaBaja IS NULL
WHERE p.activo = 1
GROUP BY p.numeroPromotor, p.region
ORDER BY ventasCerradas DESC, valorPipeline DESC;
```

**Tabla:** Sí
**Gráfico sugerido:** Stacked Bar Chart (Pipeline vs Cerradas)

---

### 🎨 ANÁLISIS AVANZADOS

#### 24. Matriz de Productos por Cliente (Heatmap Data)

```sql
SELECT
    c.tipoPersona,
    SUM(CASE WHEN tdc.id IS NOT NULL THEN 1 ELSE 0 END) as conTDC,
    SUM(CASE WHEN ch.id IS NOT NULL THEN 1 ELSE 0 END) as conCheques,
    SUM(CASE WHEN tpv.id IS NOT NULL THEN 1 ELSE 0 END) as conTPV
FROM clientes c
LEFT JOIN tdc ON c.ide = tdc.ide AND tdc.fechaBaja IS NULL
LEFT JOIN cheques ch ON c.ide = ch.ide AND ch.fechaBaja IS NULL
LEFT JOIN tpv ON c.ide = tpv.ide AND tpv.fechaBaja IS NULL
WHERE c.fechaBaja IS NULL
GROUP BY c.tipoPersona;
```

**Gráfico sugerido:** Grouped Bar Chart

---

#### 25. Análisis de Concentración de Riesgo

```sql
WITH ClienteValor AS (
    SELECT
        c.ide,
        c.nombre,
        COALESCE(SUM(tdc.lineaTotal), 0) as valorTotal
    FROM clientes c
    LEFT JOIN tdc ON c.ide = tdc.ide AND tdc.fechaBaja IS NULL
    WHERE c.fechaBaja IS NULL
    GROUP BY c.ide, c.nombre
),
TotalCartera AS (
    SELECT SUM(valorTotal) as total FROM ClienteValor
)
SELECT
    cv.nombre,
    cv.valorTotal,
    ROUND((cv.valorTotal * 100.0 / tc.total), 2) as porcentajeCartera,
    SUM(ROUND((cv.valorTotal * 100.0 / tc.total), 2)) OVER (ORDER BY cv.valorTotal DESC) as porcentajeAcumulado
FROM ClienteValor cv, TotalCartera tc
ORDER BY cv.valorTotal DESC
LIMIT 20;
```

**Tabla:** Sí
**Insight:** Identificar concentración (Pareto 80/20)

---

## Consultas Especiales por Tipo de Visualización

### Para Gráficos de Pie

- Distribución por tipo de persona
- Productos activos vs inactivos
- Prospectos convertidos vs no convertidos

### Para Gráficos de Barra

- Top clientes por valor
- Cartera por promotor
- Ofertas por etapa del pipeline

### Para Gráficos de Línea

- Tendencia de altas mensuales
- Evolución de saldos en el tiempo
- Flujo de efectivo mensual

### Para Tablas Detalladas

- Listado de oportunidades
- Reporte de clientes en riesgo
- Pipeline de ventas con detalles

---

## Notas Importantes para el Desarrollo de Consultas

### Consideraciones de Performance

1. Usar índices implícitos en PKs y FKs
2. Filtrar por `fechaBaja IS NULL` para datos activos
3. Usar agregaciones con `GROUP BY` para resúmenes

### Formato de Fechas

- Todas las fechas están en formato TEXT (ISO 8601)
- Usar `DATE()` y `STRFTIME()` para manipulación
- Ejemplo: `DATE('now', '-30 days')` para 30 días atrás

### Manejo de NULLs

- Usar `COALESCE(campo, 0)` para evitar NULLs en sumas
- `NULLIF(campo, 0)` para evitar división por cero
- `IS NULL` / `IS NOT NULL` para verificar valores

### Joins Recomendados

- `LEFT JOIN` para preservar registros maestros (clientes)
- `INNER JOIN` solo cuando se requiera coincidencia obligatoria
- Nombrar aliases claramente (c=clientes, p=promotores, etc.)

---

**Documento generado:** Enero 2026  
**Versión:** 1.0  
**Sistema:** AgenteCRM - Base de Datos SQLite
