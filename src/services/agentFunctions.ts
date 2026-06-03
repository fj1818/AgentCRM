/**
 * Catálogo de Funciones del Agente
 *
 * El "cerebro" (agente n8n) NO genera SQL libre: elige una función de este
 * catálogo y entrega sus parámetros -> { funcion, params }.
 *
 * Este módulo:
 *  - Valida/normaliza los parámetros (precisión + seguridad).
 *  - Construye el SQL exacto contra el esquema de sqlDatabaseService.
 *  - Declara cómo presentar el resultado (formato), evitando llamar al
 *    Agente de Presentación (ahorro de tokens).
 *
 * La ejecución del SQL y el formateo final (con reglas de privacidad) los
 * realiza aiAssistantService reutilizando ejecutarSQL + formatearConPresentacion.
 */

/** Definición de un KPI calculado en el frontend a partir del resultado SQL (0 tokens) */
export interface KpiHint {
  /** Etiqueta visible de la tarjeta */
  etiqueta: string
  /** Columna del resultado de la que se obtiene el valor */
  columna: string
  /** Cómo agregar la columna sobre todas las filas */
  agregado?: 'sum' | 'avg' | 'first' | 'count' | 'max' | 'min'
  /** Formato del número */
  formato?: 'moneda' | 'numero' | 'porcentaje' | 'texto'
}

/** Pista de presentación, compatible con PresentationResponse de aiAssistantService */
export interface PresentacionHint {
  formato:
    | 'texto'
    | 'tabla'
    | 'multi_tabla'
    | 'kpi'
    | 'grafico_bar'
    | 'grafico_pie'
    | 'grafico_line'
    | 'grafico_polar'
  titulo: string
  ejeX?: string
  ejeY?: string
  mensaje_interpretacion: string
  /** Tarjetas KPI a mostrar arriba de la tabla/gráfico */
  kpis?: KpiHint[]
  /** Texto analítico ("el porqué"), en markdown */
  insight?: string
}

/** Resultado de construir una función: SQL listo + cómo presentarlo */
export interface FuncionConstruida {
  sql: string
  presentacion: PresentacionHint
}

export interface FuncionError {
  error: string
}

export type ResultadoConstruccion = FuncionConstruida | FuncionError

/** Definición declarativa de un parámetro (también sirve para el pre-prompt) */
interface ParamDef {
  tipo: 'string' | 'number' | 'boolean' | 'enum'
  descripcion: string
  requerido?: boolean
  opciones?: string[]
  default?: unknown
}

/** Definición de una función del catálogo */
interface FuncionDef {
  nombre: string
  descripcion: string
  params: Record<string, ParamDef>
  construir: (params: Record<string, unknown>) => ResultadoConstruccion
}

// ── Utilidades de seguridad/normalización ──────────────────────────────────

/** Limita un entero entre [min, max] con valor por defecto */
function clampInt(valor: unknown, def: number, min: number, max: number): number {
  const n = Number(valor)
  if (!Number.isFinite(n)) return def
  return Math.max(min, Math.min(max, Math.trunc(n)))
}

/** Escapa comillas simples para literales SQL (defensa básica) */
function esc(valor: unknown): string {
  return String(valor ?? '').replace(/'/g, "''")
}

/** Resuelve una familia/producto a la tabla y columna de monto correspondiente */
const PRODUCTOS_SALDO: Record<string, { tabla: string; columnaMonto: string; etiqueta: string }> = {
  tdc: { tabla: 'tdc', columnaMonto: 'lineaTotal', etiqueta: 'Línea total TDC' },
  cheques: { tabla: 'cheques', columnaMonto: 'saldoLinea', etiqueta: 'Saldo cheques' },
  tpv: { tabla: 'tpv', columnaMonto: 'saldoFacturacion', etiqueta: 'Facturación TPV' },
  creditos: { tabla: 'creditos', columnaMonto: 'montoCredito', etiqueta: 'Monto crédito' },
}

const ETAPAS_OPORTUNIDAD = ['No contactado', 'Interesado', 'Negociación', 'Descartado', 'Fabrica', 'Entregado', 'Timbrado']
const ETAPAS_PROSPECTO = ['No contactado', 'En negociación', 'Interesado', 'Descartado', 'Convertido']
const FAMILIAS = ['TDC', 'TPV', 'Cheques', 'Crédito', 'Seguros', 'Nóminas']

/** Tenencia de productos: tabla, columna de monto y (si aplica) columna de vencimiento */
const TENENCIA: Record<string, { tabla: string; monto: string; venc?: string; etiqueta: string }> = {
  tdc: { tabla: 'tdc', monto: 'lineaTotal', venc: 'fechaVencimiento', etiqueta: 'TDC' },
  nomina: { tabla: 'nominas', monto: 'montoNomina', etiqueta: 'Nómina' },
  nominas: { tabla: 'nominas', monto: 'montoNomina', etiqueta: 'Nómina' },
  cheques: { tabla: 'cheques', monto: 'saldoLinea', etiqueta: 'Cheques' },
  tpv: { tabla: 'tpv', monto: 'saldoFacturacion', etiqueta: 'TPV' },
  credito: { tabla: 'creditos', monto: 'montoCredito', venc: 'fechaVencimiento', etiqueta: 'Crédito' },
  creditos: { tabla: 'creditos', monto: 'montoCredito', venc: 'fechaVencimiento', etiqueta: 'Crédito' },
  seguros: { tabla: 'seguros', monto: 'primaAnual', venc: 'fechaVencimiento', etiqueta: 'Seguros' },
}

/** Productos que tienen fecha de vencimiento (para "contratos/líneas por vencer") */
const VENCIBLES: Record<string, { tabla: string; monto: string; ref: string; etiqueta: string }> = {
  tdc: { tabla: 'tdc', monto: 'lineaTotal', ref: 'numeroLinea', etiqueta: 'Líneas TDC' },
  credito: { tabla: 'creditos', monto: 'montoCredito', ref: 'numeroLinea', etiqueta: 'Créditos' },
  creditos: { tabla: 'creditos', monto: 'montoCredito', ref: 'numeroLinea', etiqueta: 'Créditos' },
  seguros: { tabla: 'seguros', monto: 'primaAnual', ref: 'numeroPoliza', etiqueta: 'Pólizas de seguro' },
}

/**
 * Subconsulta SQL que calcula la rentabilidad anual estimada por cliente.
 * Coeficientes de margen por producto (ver obtenerEsquemaSQL).
 */
const SQL_RENTABILIDAD = `
  SELECT c.ide, c.nombre, c.tipoPersona,
    ROUND(COALESCE(t.v,0))  AS rentTDC,
    ROUND(COALESCE(cr.v,0)) AS rentCredito,
    ROUND(COALESCE(ch.v,0)) AS rentCheques,
    ROUND(COALESCE(tp.v,0)) AS rentTPV,
    ROUND(COALESCE(s.v,0))  AS rentSeguros,
    ROUND(COALESCE(n.v,0))  AS rentNomina,
    ROUND(COALESCE(t.v,0)+COALESCE(cr.v,0)+COALESCE(ch.v,0)+COALESCE(tp.v,0)+COALESCE(s.v,0)+COALESCE(n.v,0)) AS rentabilidadTotal
  FROM clientes c
  LEFT JOIN (SELECT ide, SUM(lineaUso)*0.30 v FROM tdc WHERE fechaBaja IS NULL GROUP BY ide) t ON t.ide=c.ide
  LEFT JOIN (SELECT ide, SUM(saldoActual)*0.18 v FROM creditos WHERE fechaBaja IS NULL GROUP BY ide) cr ON cr.ide=c.ide
  LEFT JOIN (SELECT ide, SUM(saldoLinea)*0.04 v FROM cheques WHERE fechaBaja IS NULL GROUP BY ide) ch ON ch.ide=c.ide
  LEFT JOIN (SELECT ide, SUM(saldoFacturacion)*0.012 v FROM tpv WHERE fechaBaja IS NULL GROUP BY ide) tp ON tp.ide=c.ide
  LEFT JOIN (SELECT ide, SUM(primaAnual)*0.20 v FROM seguros WHERE fechaBaja IS NULL GROUP BY ide) s ON s.ide=c.ide
  LEFT JOIN (SELECT ide, SUM(montoNomina)*0.02 v FROM nominas WHERE fechaBaja IS NULL GROUP BY ide) n ON n.ide=c.ide
  WHERE c.fechaBaja IS NULL`

// ── Catálogo ────────────────────────────────────────────────────────────────

export const CATALOGO: FuncionDef[] = [
  {
    nombre: 'listadoClientes',
    descripcion: 'Lista clientes. Útil para "muéstrame clientes", "clientes activos".',
    params: {
      soloActivos: { tipo: 'boolean', descripcion: 'true = solo clientes sin fecha de baja', default: true },
      limite: { tipo: 'number', descripcion: 'Máximo de filas (1-200)', default: 50 },
    },
    construir: (p) => {
      const where = p.soloActivos === false ? '' : 'WHERE fechaBaja IS NULL'
      const limite = clampInt(p.limite, 50, 1, 200)
      return {
        sql: `SELECT ide, nombre, rfc, tipoPersona, fechaAlta FROM clientes ${where} ORDER BY fechaAlta DESC LIMIT ${limite}`,
        presentacion: { formato: 'tabla', titulo: 'Listado de clientes', mensaje_interpretacion: 'Clientes encontrados.' },
      }
    },
  },

  {
    nombre: 'detalleCliente',
    descripcion: 'Datos de un cliente específico por su IDE. Para "información del cliente X".',
    params: {
      ide: { tipo: 'string', descripcion: 'Identificador IDE del cliente', requerido: true },
    },
    construir: (p) => {
      if (!p.ide) return { error: 'Falta el parámetro "ide".' }
      return {
        sql: `SELECT ide, nombre, rfc, tipoPersona, fechaAlta, fechaBaja FROM clientes WHERE ide = '${esc(p.ide)}'`,
        presentacion: { formato: 'tabla', titulo: 'Detalle de cliente', mensaje_interpretacion: 'Información del cliente.' },
      }
    },
  },

  {
    nombre: 'topClientesPorSaldo',
    descripcion: 'Ranking de clientes con mayor saldo/monto en un producto. Para "clientes con más saldo en cheques/TDC/TPV/crédito".',
    params: {
      producto: { tipo: 'enum', descripcion: 'Producto a evaluar', requerido: true, opciones: Object.keys(PRODUCTOS_SALDO) },
      limite: { tipo: 'number', descripcion: 'Top N (1-50)', default: 10 },
    },
    construir: (p) => {
      const key = String(p.producto || '').toLowerCase()
      const cfg = PRODUCTOS_SALDO[key]
      if (!cfg) return { error: `Producto inválido. Opciones: ${Object.keys(PRODUCTOS_SALDO).join(', ')}` }
      const limite = clampInt(p.limite, 10, 1, 50)
      return {
        sql: `SELECT t.ide, SUM(t.${cfg.columnaMonto}) AS monto
              FROM ${cfg.tabla} t
              WHERE t.fechaBaja IS NULL
              GROUP BY t.ide
              ORDER BY monto DESC
              LIMIT ${limite}`,
        presentacion: { formato: 'tabla', titulo: `Top ${limite} por ${cfg.etiqueta}`, ejeX: 'ide', ejeY: 'monto', mensaje_interpretacion: `Clientes con mayor ${cfg.etiqueta}.` },
      }
    },
  },

  {
    nombre: 'variacionesRelevantes',
    descripcion: 'Movimientos (variaciones) de cheques más grandes por magnitud. Para "variaciones/movimientos más grandes", "mayores ingresos o egresos".',
    params: {
      tipo: { tipo: 'enum', descripcion: 'ingreso (>0), egreso (<0) o ambos', default: 'ambos', opciones: ['ingreso', 'egreso', 'ambos'] },
      limite: { tipo: 'number', descripcion: 'Máximo de filas (1-100)', default: 15 },
    },
    construir: (p) => {
      const tipo = String(p.tipo || 'ambos').toLowerCase()
      let where = ''
      if (tipo === 'ingreso') where = 'WHERE montoMovimiento > 0'
      else if (tipo === 'egreso') where = 'WHERE montoMovimiento < 0'
      const limite = clampInt(p.limite, 15, 1, 100)
      return {
        sql: `SELECT ide, numeroLinea, fechaMovimiento, montoMovimiento
              FROM variacionescheques ${where}
              ORDER BY ABS(montoMovimiento) DESC
              LIMIT ${limite}`,
        presentacion: { formato: 'tabla', titulo: 'Variaciones más relevantes', mensaje_interpretacion: 'Movimientos de mayor magnitud.' },
      }
    },
  },

  {
    nombre: 'listadoProspectos',
    descripcion: 'Lista de prospectos con su oferta de interés. Filtros opcionales por etapa y familia.',
    params: {
      etapa: { tipo: 'enum', descripcion: 'Etapa del prospecto', opciones: ETAPAS_PROSPECTO },
      familia: { tipo: 'enum', descripcion: 'Familia de producto', opciones: FAMILIAS },
      limite: { tipo: 'number', descripcion: 'Máximo de filas (1-200)', default: 50 },
    },
    construir: (p) => {
      const filtros: string[] = []
      if (p.etapa && ETAPAS_PROSPECTO.includes(String(p.etapa))) filtros.push(`o.etapa = '${esc(p.etapa)}'`)
      if (p.familia && FAMILIAS.includes(String(p.familia))) filtros.push(`o.familiaProducto = '${esc(p.familia)}'`)
      const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : ''
      const limite = clampInt(p.limite, 50, 1, 200)
      return {
        sql: `SELECT pr.rfc, pr.tipoPersona, o.familiaProducto, o.productoInteres, o.etapa, o.fechaAlta
              FROM prospectos pr
              LEFT JOIN ofertasprospectos o ON o.idProspecto = pr.idProspecto
              ${where}
              ORDER BY o.fechaAlta DESC
              LIMIT ${limite}`,
        presentacion: { formato: 'tabla', titulo: 'Listado de prospectos', mensaje_interpretacion: 'Prospectos encontrados.' },
      }
    },
  },

  {
    nombre: 'listadoOportunidades',
    descripcion: 'Lista de oportunidades/ofertas de clientes. Filtros opcionales por etapa y familia.',
    params: {
      etapa: { tipo: 'enum', descripcion: 'Etapa de la oportunidad', opciones: ETAPAS_OPORTUNIDAD },
      familia: { tipo: 'enum', descripcion: 'Familia de producto', opciones: FAMILIAS },
      limite: { tipo: 'number', descripcion: 'Máximo de filas (1-200)', default: 50 },
    },
    construir: (p) => {
      const filtros: string[] = []
      if (p.etapa && ETAPAS_OPORTUNIDAD.includes(String(p.etapa))) filtros.push(`etapa = '${esc(p.etapa)}'`)
      if (p.familia && FAMILIAS.includes(String(p.familia))) filtros.push(`familiaProducto = '${esc(p.familia)}'`)
      const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : ''
      const limite = clampInt(p.limite, 50, 1, 200)
      return {
        sql: `SELECT ide, familiaProducto, productoInteres, etapa, montoOferta, fechaAlta
              FROM ofertasclientes ${where}
              ORDER BY fechaAlta DESC
              LIMIT ${limite}`,
        presentacion: { formato: 'tabla', titulo: 'Listado de oportunidades', mensaje_interpretacion: 'Oportunidades encontradas.' },
      }
    },
  },

  {
    nombre: 'conteoPorEtapa',
    descripcion: 'Cuenta cuántas oportunidades o prospectos hay por etapa. Para "distribución por etapa", "embudo".',
    params: {
      entidad: { tipo: 'enum', descripcion: 'Qué contar', default: 'oportunidades', opciones: ['oportunidades', 'prospectos'] },
    },
    construir: (p) => {
      const entidad = String(p.entidad || 'oportunidades').toLowerCase()
      const tabla = entidad === 'prospectos' ? 'ofertasprospectos' : 'ofertasclientes'
      return {
        sql: `SELECT etapa, COUNT(*) AS total FROM ${tabla} GROUP BY etapa ORDER BY total DESC`,
        presentacion: { formato: 'grafico_pie', titulo: `Distribución por etapa (${entidad})`, ejeX: 'etapa', ejeY: 'total', mensaje_interpretacion: 'Distribución por etapa.' },
      }
    },
  },

  {
    nombre: 'montoPorFamilia',
    descripcion: 'Suma del monto de oportunidades agrupado por familia de producto. Para "ventas/monto por producto".',
    params: {},
    construir: () => ({
      sql: `SELECT familiaProducto, SUM(montoOferta) AS total
            FROM ofertasclientes
            GROUP BY familiaProducto
            ORDER BY total DESC`,
      presentacion: { formato: 'grafico_bar', titulo: 'Monto por familia de producto', ejeX: 'familiaProducto', ejeY: 'total', mensaje_interpretacion: 'Monto total por familia.' },
    }),
  },

  {
    nombre: 'clientesMasRentables',
    descripcion: 'Ranking de clientes por rentabilidad anual estimada, con el desglose de margen por producto (TDC, crédito, cheques, TPV, seguros, nómina). Para "cliente más rentable y por qué", "top clientes que más dejan".',
    params: {
      limite: { tipo: 'number', descripcion: 'Top N (1-50)', default: 10 },
    },
    construir: (p) => {
      const limite = clampInt(p.limite, 10, 1, 50)
      return {
        sql: `${SQL_RENTABILIDAD}
              ORDER BY rentabilidadTotal DESC
              LIMIT ${limite}`,
        presentacion: {
          formato: 'kpi',
          titulo: `Top ${limite} clientes más rentables`,
          ejeX: 'nombre',
          ejeY: 'rentabilidadTotal',
          kpis: [
            { etiqueta: 'Cliente más rentable', columna: 'nombre', agregado: 'first', formato: 'texto' },
            { etiqueta: 'Rentabilidad anual (líder)', columna: 'rentabilidadTotal', agregado: 'first', formato: 'moneda' },
            { etiqueta: 'Rentabilidad del top', columna: 'rentabilidadTotal', agregado: 'sum', formato: 'moneda' },
          ],
          insight: 'La rentabilidad es el **margen anual estimado** que deja cada cliente, sumando el margen de sus productos activos: crédito y TDC son los de mayor margen (18%–30% sobre saldo dispuesto), seguidos de seguros (20% de prima), captación en cheques (4%), TPV (1.2% de facturación) y nómina (2%). El líder concentra su valor en los productos de mayor margen; revisa su columna de mayor importe para confirmar de dónde proviene.',
          mensaje_interpretacion: 'Clientes ordenados por rentabilidad anual estimada.',
        },
      }
    },
  },

  {
    nombre: 'crossSellGap',
    descripcion: 'Clientes que SÍ tienen un producto pero NO tienen otro (hueco de venta cruzada). Ej: "clientes con TDC pero sin nómina". Devuelve el monto del producto que sí tienen, ordenado de mayor a menor.',
    params: {
      tiene: { tipo: 'enum', descripcion: 'Producto que el cliente SÍ tiene', requerido: true, opciones: ['tdc', 'nomina', 'cheques', 'tpv', 'credito', 'seguros'] },
      noTiene: { tipo: 'enum', descripcion: 'Producto que el cliente NO tiene', requerido: true, opciones: ['tdc', 'nomina', 'cheques', 'tpv', 'credito', 'seguros'] },
      limite: { tipo: 'number', descripcion: 'Top N (1-100)', default: 20 },
    },
    construir: (p) => {
      const tiene = TENENCIA[String(p.tiene || '').toLowerCase()]
      const noTiene = TENENCIA[String(p.noTiene || '').toLowerCase()]
      if (!tiene || !noTiene) return { error: `Productos válidos: ${Object.keys(TENENCIA).join(', ')}` }
      const limite = clampInt(p.limite, 20, 1, 100)
      return {
        sql: `SELECT c.ide, c.nombre, c.tipoPersona, ROUND(g.monto) AS monto${tiene.venc ? ', g.proximoVencimiento' : ''}
              FROM clientes c
              JOIN (
                SELECT ide, SUM(${tiene.monto}) AS monto${tiene.venc ? `, MIN(${tiene.venc}) AS proximoVencimiento` : ''}
                FROM ${tiene.tabla} WHERE fechaBaja IS NULL GROUP BY ide
              ) g ON g.ide = c.ide
              WHERE c.fechaBaja IS NULL
                AND c.ide NOT IN (SELECT ide FROM ${noTiene.tabla} WHERE fechaBaja IS NULL)
              ORDER BY g.monto DESC
              LIMIT ${limite}`,
        presentacion: {
          formato: 'tabla',
          titulo: `Clientes con ${tiene.etiqueta} pero sin ${noTiene.etiqueta}`,
          kpis: [
            { etiqueta: 'Clientes detectados', columna: 'ide', agregado: 'count', formato: 'numero' },
            { etiqueta: `Monto total en ${tiene.etiqueta}`, columna: 'monto', agregado: 'sum', formato: 'moneda' },
          ],
          insight: `Estos clientes ya confían en **${tiene.etiqueta}** pero no tienen **${noTiene.etiqueta}**: son los candidatos naturales para una campaña de venta cruzada. Prioriza los de mayor monto.`,
          mensaje_interpretacion: `Oportunidad de venta cruzada: ${tiene.etiqueta} → ${noTiene.etiqueta}.`,
        },
      }
    },
  },

  {
    nombre: 'contratosPorVencer',
    descripcion: 'Contratos/líneas próximos a vencer dentro de N días: TDC, créditos o seguros. Para "contratos por vencer", "líneas que vencen este mes".',
    params: {
      producto: { tipo: 'enum', descripcion: 'Producto a revisar', default: 'tdc', opciones: ['tdc', 'credito', 'seguros'] },
      dias: { tipo: 'number', descripcion: 'Ventana en días hacia adelante (1-365)', default: 90 },
      limite: { tipo: 'number', descripcion: 'Máximo de filas (1-200)', default: 50 },
    },
    construir: (p) => {
      const cfg = VENCIBLES[String(p.producto || 'tdc').toLowerCase()]
      if (!cfg) return { error: `Productos con vencimiento: ${Object.keys(VENCIBLES).join(', ')}` }
      const dias = clampInt(p.dias, 90, 1, 365)
      const limite = clampInt(p.limite, 50, 1, 200)
      return {
        sql: `SELECT ide, ${cfg.ref} AS contrato, producto, ROUND(${cfg.monto}) AS monto, fechaVencimiento,
                CAST(julianday(fechaVencimiento) - julianday('now') AS INTEGER) AS diasRestantes
              FROM ${cfg.tabla}
              WHERE fechaBaja IS NULL AND fechaVencimiento IS NOT NULL
                AND fechaVencimiento >= date('now')
                AND fechaVencimiento <= date('now', '+${dias} days')
              ORDER BY fechaVencimiento ASC
              LIMIT ${limite}`,
        presentacion: {
          formato: 'tabla',
          titulo: `${cfg.etiqueta} por vencer (próximos ${dias} días)`,
          kpis: [
            { etiqueta: 'Contratos por vencer', columna: 'ide', agregado: 'count', formato: 'numero' },
            { etiqueta: 'Monto en riesgo', columna: 'monto', agregado: 'sum', formato: 'moneda' },
            { etiqueta: 'Vencimiento más próximo', columna: 'diasRestantes', agregado: 'min', formato: 'numero' },
          ],
          insight: `Contratos de **${cfg.etiqueta}** que vencen en los próximos ${dias} días. Contáctalos antes del vencimiento para renovar/retener; ordénalos por días restantes.`,
          mensaje_interpretacion: `${cfg.etiqueta} próximos a vencer.`,
        },
      }
    },
  },

  {
    nombre: 'resumen360Cliente',
    descripcion: 'Foto 360° de un cliente: sus productos activos con montos y su rentabilidad estimada. Para "todo de un cliente", "resumen del cliente X".',
    params: {
      ide: { tipo: 'string', descripcion: 'IDE del cliente', requerido: true },
    },
    construir: (p) => {
      if (!p.ide) return { error: 'Falta el parámetro "ide".' }
      const ide = esc(p.ide)
      return {
        sql: `${SQL_RENTABILIDAD} AND c.ide = '${ide}'`,
        presentacion: {
          formato: 'kpi',
          titulo: `Resumen 360° del cliente ${ide}`,
          kpis: [
            { etiqueta: 'Rentabilidad anual estimada', columna: 'rentabilidadTotal', agregado: 'first', formato: 'moneda' },
            { etiqueta: 'Margen TDC', columna: 'rentTDC', agregado: 'first', formato: 'moneda' },
            { etiqueta: 'Margen Crédito', columna: 'rentCredito', agregado: 'first', formato: 'moneda' },
          ],
          insight: 'Desglose del margen anual por producto del cliente. El total es la suma de los márgenes; las columnas muestran de qué producto proviene su valor.',
          mensaje_interpretacion: 'Resumen de rentabilidad del cliente.',
        },
      }
    },
  },
]

const CATALOGO_MAP = new Map(CATALOGO.map((f) => [f.nombre, f]))

/** Construye el SQL+presentación para una función del catálogo */
export function construirFuncion(nombre: string, params: Record<string, unknown> = {}): ResultadoConstruccion {
  const def = CATALOGO_MAP.get(nombre)
  if (!def) return { error: `Función desconocida: ${nombre}` }
  return def.construir(params)
}

/** ¿Existe la función en el catálogo? */
export function existeFuncion(nombre: string): boolean {
  return CATALOGO_MAP.has(nombre)
}

/**
 * Genera el texto del catálogo para incluir en el pre-prompt del agente n8n.
 * Mantiene al "cerebro" preciso: solo puede elegir estas funciones y params.
 */
export function descripcionCatalogoParaPrompt(): string {
  const lineas = CATALOGO.map((f) => {
    const params = Object.entries(f.params)
      .map(([k, d]) => {
        const req = d.requerido ? ' (requerido)' : ''
        const op = d.opciones ? ` [${d.opciones.join('|')}]` : ''
        return `    - ${k}: ${d.tipo}${op}${req} — ${d.descripcion}`
      })
      .join('\n')
    return `• ${f.nombre}: ${f.descripcion}\n${params || '    (sin parámetros)'}`
  })
  return lineas.join('\n\n')
}
