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

/** Pista de presentación, compatible con PresentationResponse de aiAssistantService */
export interface PresentacionHint {
  formato:
    | 'texto'
    | 'tabla'
    | 'multi_tabla'
    | 'grafico_bar'
    | 'grafico_pie'
    | 'grafico_line'
    | 'grafico_polar'
  titulo: string
  ejeX?: string
  ejeY?: string
  mensaje_interpretacion: string
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
