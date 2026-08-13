/**
 * Herramientas del agente.
 *
 * Cada herramienta recibe argumentos planos y devuelve texto + bloques de UI.
 * Las que modifican datos devuelven además un `registro` para la bitácora, que
 * es la capa de rendición de cuentas de la demo.
 */

import type { Block, RespuestaHerramienta, RecordCard, Tono } from './types'
import {
  ofertas,
  clientePorId,
  diasHasta,
  formatoMoneda,
  formatoFecha,
  ETAPAS_ABIERTAS,
  ETAPAS,
  YO,
  type Cliente,
  type Oferta,
  type Etapa,
} from './data'

// ── Helpers de presentación ──────────────────────────────────────────────────

export const tonoEtapa = (etapa: Etapa): Tono =>
  etapa === 'Ganada' ? 'positivo' : etapa === 'Perdida' ? 'negativo' : etapa === 'Negociación' ? 'alerta' : 'neutro'

export const tonoRiesgo = (r: Cliente['riesgoFuga']): Tono =>
  r === 'bajo' ? 'positivo' : r === 'medio' ? 'alerta' : 'negativo'

export const suma = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

export function fichaCliente(c: Cliente): RecordCard {
  const abiertas = ofertas.filter((o) => o.clienteId === c.id && ETAPAS_ABIERTAS.includes(o.etapa))
  const dias = -diasHasta(c.ultimoContacto)
  return {
    id: c.id,
    titulo: c.nombre,
    subtitulo: `${c.giro} · ${c.ciudad}`,
    avatar: c.nombre,
    badge: { texto: `Riesgo de fuga ${c.riesgoFuga}`, tono: tonoRiesgo(c.riesgoFuga) },
    campos: [
      { label: 'Contacto', value: `${c.contacto} — ${c.puesto}`, icono: 'user' },
      { label: 'Teléfono', value: c.telefono, icono: 'phone' },
      { label: 'Correo', value: c.email, icono: 'mail' },
      { label: 'RFC', value: c.rfc, icono: 'hash' },
      { label: 'Facturación anual', value: formatoMoneda(c.facturacionAnual), icono: 'trending' },
      { label: 'Saldo promedio', value: formatoMoneda(c.saldoPromedio), icono: 'wallet' },
      { label: 'Antigüedad', value: `${Math.floor(c.antiguedadMeses / 12)} años ${c.antiguedadMeses % 12} meses`, icono: 'calendar' },
      { label: 'Último contacto', value: `${formatoFecha(c.ultimoContacto)} (hace ${dias} días)`, icono: 'clock' },
      { label: 'Productos contratados', value: c.productos.join(', '), icono: 'package' },
      { label: 'Ofertas abiertas', value: `${abiertas.length} por ${formatoMoneda(suma(abiertas.map((o) => o.monto)))}`, icono: 'briefcase' },
    ],
    medidor: { label: 'Salud de la relación', valor: c.salud, tono: c.salud > 70 ? 'positivo' : c.salud > 45 ? 'alerta' : 'negativo' },
    acciones: [
      { label: 'Ver historial', icon: 'history', variant: 'secondary', send: `Muéstrame el historial de ${c.nombre}` },
      { label: 'Crear oferta', icon: 'plus', variant: 'primary', run: { tool: 'form_nueva_oferta', args: { clienteId: c.id } } },
      { label: 'Agendar tarea', icon: 'calendar', variant: 'secondary', run: { tool: 'form_nueva_tarea', args: { clienteId: c.id } } },
      { label: '¿Qué le vendo?', icon: 'sparkles', variant: 'ghost', send: `¿Qué producto le recomiendo a ${c.nombre}?` },
    ],
  }
}

export function fichaOferta(o: Oferta): RecordCard {
  const c = clientePorId(o.clienteId)
  const dias = diasHasta(o.fechaCierre)
  return {
    id: o.id,
    titulo: `${o.producto} — ${formatoMoneda(o.monto)}`,
    subtitulo: `${o.cliente} · ${o.id}`,
    avatar: o.cliente,
    badge: { texto: o.etapa, tono: tonoEtapa(o.etapa) },
    campos: [
      { label: 'Familia', value: o.familia, icono: 'package' },
      { label: 'Ejecutivo', value: o.ejecutivo, icono: 'user' },
      { label: 'Campaña de origen', value: o.campana, icono: 'megaphone' },
      { label: 'Alta', value: formatoFecha(o.fechaAlta), icono: 'calendar' },
      {
        label: 'Cierre estimado',
        value: `${formatoFecha(o.fechaCierre)} (${dias < 0 ? `vencida hace ${-dias} d` : `en ${dias} d`})`,
        icono: 'clock',
      },
      { label: 'Sin movimiento', value: `${o.diasSinMover} días`, icono: 'pause' },
      ...(c ? [{ label: 'Teléfono del cliente', value: c.telefono, icono: 'phone' }] : []),
    ],
    medidor: {
      label: 'Probabilidad de cierre',
      valor: o.probabilidad,
      tono: o.probabilidad > 65 ? 'positivo' : o.probabilidad > 35 ? 'alerta' : 'negativo',
    },
    nota: o.notas,
    acciones: ETAPAS_ABIERTAS.includes(o.etapa)
      ? [
          { label: 'Avanzar etapa', icon: 'arrowRight', variant: 'primary', run: { tool: 'confirmar_avance', args: { ofertaId: o.id } } },
          { label: 'Editar oferta', icon: 'edit', variant: 'secondary', run: { tool: 'form_editar_oferta', args: { ofertaId: o.id } } },
          { label: 'Agendar tarea', icon: 'calendar', variant: 'secondary', run: { tool: 'form_nueva_tarea', args: { ofertaId: o.id, clienteId: o.clienteId } } },
          { label: 'Marcar perdida', icon: 'x', variant: 'danger', run: { tool: 'confirmar_perdida', args: { ofertaId: o.id } } },
        ]
      : [{ label: 'Ver cliente', icon: 'building', variant: 'secondary', send: `Abre la ficha de ${o.cliente}` }],
  }
}

export const COLUMNAS_OFERTA = [
  { key: 'id', label: 'Oferta', width: '90px' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'producto', label: 'Producto' },
  { key: 'monto', label: 'Monto', format: 'money' as const, align: 'right' as const },
  { key: 'etapa', label: 'Etapa', format: 'badge' as const },
  { key: 'probabilidad', label: 'Prob.', format: 'percent' as const, align: 'right' as const },
  { key: 'fechaCierre', label: 'Cierre', format: 'date' as const },
]

// ── Consulta: portafolio y embudo ────────────────────────────────────────────

export function resumenPortafolio(args: { ejecutivo?: string } = {}): RespuestaHerramienta {
  const ejec = args.ejecutivo ?? YO
  const mias = ofertas.filter((o) => o.ejecutivo === ejec)
  const abiertas = mias.filter((o) => ETAPAS_ABIERTAS.includes(o.etapa))
  const ganadas = mias.filter((o) => o.etapa === 'Ganada')
  const perdidas = mias.filter((o) => o.etapa === 'Perdida')
  const ponderado = suma(abiertas.map((o) => (o.monto * o.probabilidad) / 100))
  const tasaCierre = ganadas.length + perdidas.length > 0
    ? Math.round((ganadas.length / (ganadas.length + perdidas.length)) * 100)
    : 0
  const estancadas = abiertas.filter((o) => o.diasSinMover > 30)
  const venceEstaSemana = abiertas.filter((o) => diasHasta(o.fechaCierre) >= 0 && diasHasta(o.fechaCierre) <= 7)

  const porEtapa = ETAPAS_ABIERTAS.map((e) => {
    const grupo = abiertas.filter((o) => o.etapa === e)
    return { etapa: e, cantidad: grupo.length, monto: suma(grupo.map((o) => o.monto)), send: `Muéstrame mis ofertas en etapa ${e}` }
  })

  const bloques: Block[] = [
    {
      kind: 'kpis',
      items: [
        { etiqueta: 'Embudo abierto', valor: formatoMoneda(suma(abiertas.map((o) => o.monto))), detalle: `${abiertas.length} ofertas vivas`, icono: 'briefcase', tono: 'neutro' },
        { etiqueta: 'Pronóstico ponderado', valor: formatoMoneda(ponderado), detalle: 'Monto × probabilidad', icono: 'target', tono: 'positivo' },
        { etiqueta: 'Tasa de cierre', valor: `${tasaCierre}%`, detalle: `${ganadas.length} ganadas / ${perdidas.length} perdidas`, icono: 'trophy', tono: tasaCierre >= 50 ? 'positivo' : 'alerta' },
        { etiqueta: 'Ofertas estancadas', valor: String(estancadas.length), detalle: 'Más de 30 días sin movimiento', icono: 'alert', tono: estancadas.length > 3 ? 'negativo' : 'alerta' },
      ],
    },
    { kind: 'pipeline', titulo: 'Embudo por etapa', etapas: porEtapa, total: formatoMoneda(suma(abiertas.map((o) => o.monto))) },
    {
      kind: 'chart',
      variante: 'donut',
      titulo: 'Distribución del embudo por familia de producto',
      unidad: 'money',
      series: [...new Set(abiertas.map((o) => o.familia))].map((f) => ({
        label: f,
        value: suma(abiertas.filter((o) => o.familia === f).map((o) => o.monto)),
      })).sort((a, b) => b.value - a.value),
    },
    {
      kind: 'choices',
      titulo: '¿Qué quieres hacer ahora?',
      opciones: [
        { label: `Revisar ${estancadas.length} ofertas estancadas`, icon: 'alert', variant: 'primary', send: 'Muéstrame mis ofertas estancadas' },
        { label: `${venceEstaSemana.length} cierran esta semana`, icon: 'clock', variant: 'secondary', send: 'Qué ofertas cierran esta semana' },
        { label: 'Plan del día', icon: 'sparkles', variant: 'secondary', send: 'Arma mi plan del día' },
      ],
    },
  ]

  return {
    texto: `Tu portafolio tiene **${abiertas.length} ofertas abiertas** por ${formatoMoneda(suma(abiertas.map((o) => o.monto)))}. El pronóstico ponderado es de ${formatoMoneda(ponderado)}. Lo que más te está costando dinero ahora mismo son las **${estancadas.length} ofertas estancadas** más de 30 días.`,
    bloques,
  }
}

export function ofertasEstancadas(): RespuestaHerramienta {
  const lista = ofertas
    .filter((o) => o.ejecutivo === YO && ETAPAS_ABIERTAS.includes(o.etapa) && o.diasSinMover > 30)
    .sort((a, b) => b.monto - a.monto)

  if (!lista.length) {
    return { texto: 'No tienes ofertas estancadas. Todo tu embudo se movió en los últimos 30 días.', bloques: [] }
  }

  const enRiesgo = suma(lista.map((o) => o.monto))
  return {
    texto: `Detecté **${lista.length} ofertas sin movimiento hace más de 30 días**, con ${formatoMoneda(enRiesgo)} en riesgo. Las ordené por monto: atacar las tres primeras recupera ${formatoMoneda(suma(lista.slice(0, 3).map((o) => o.monto)))}.`,
    bloques: [
      {
        kind: 'table',
        titulo: 'Ofertas estancadas',
        columnas: [...COLUMNAS_OFERTA.slice(0, 5), { key: 'diasSinMover', label: 'Sin mover', format: 'dias' as const, align: 'right' as const }],
        filas: lista.map((o) => ({ ...o })),
        pageSize: 8,
        pie: `${lista.length} ofertas · ${formatoMoneda(enRiesgo)} en riesgo`,
        accionFila: { label: 'Abrir', icon: 'arrowRight', send: 'Abre la oferta {id}' },
      },
      {
        kind: 'choices',
        opciones: [
          { label: 'Agendar seguimiento a las 3 más grandes', icon: 'calendar', variant: 'primary', run: { tool: 'confirmar_seguimiento_masivo', args: { ids: lista.slice(0, 3).map((o) => o.id) } } },
          { label: 'Ver la más grande', icon: 'briefcase', variant: 'secondary', send: `Abre la oferta ${lista[0]!.id}` },
        ],
      },
    ],
  }
}

export function ofertasQueCierran(args: { dias?: number } = {}): RespuestaHerramienta {
  const rango = args.dias ?? 7
  const lista = ofertas
    .filter((o) => o.ejecutivo === YO && ETAPAS_ABIERTAS.includes(o.etapa))
    .filter((o) => {
      const d = diasHasta(o.fechaCierre)
      return d >= -30 && d <= rango
    })
    .sort((a, b) => (a.fechaCierre < b.fechaCierre ? -1 : 1))

  const vencidas = lista.filter((o) => diasHasta(o.fechaCierre) < 0)

  return {
    texto: lista.length
      ? `Tienes **${lista.length} ofertas con fecha de cierre dentro de los próximos ${rango} días**, de las cuales ${vencidas.length} ya pasaron su fecha comprometida. Suman ${formatoMoneda(suma(lista.map((o) => o.monto)))}.`
      : `No hay ofertas con cierre comprometido en los próximos ${rango} días.`,
    bloques: lista.length
      ? [
          {
            kind: 'table',
            titulo: `Cierres comprometidos (${rango} días)`,
            columnas: COLUMNAS_OFERTA,
            filas: lista.map((o) => ({ ...o })),
            pageSize: 8,
            pie: `${vencidas.length} ya vencieron su fecha`,
            accionFila: { label: 'Abrir', icon: 'arrowRight', send: 'Abre la oferta {id}' },
          },
        ]
      : [],
  }
}

export function ofertasPorEtapa(args: { etapa: string }): RespuestaHerramienta {
  const etapa = ETAPAS.find((e) => e.toLowerCase() === String(args.etapa).toLowerCase())
  if (!etapa) return { texto: `No reconozco la etapa "${args.etapa}". Las válidas son: ${ETAPAS.join(', ')}.` }
  const lista = ofertas.filter((o) => o.ejecutivo === YO && o.etapa === etapa).sort((a, b) => b.monto - a.monto)
  return {
    texto: `**${lista.length} ofertas** en etapa ${etapa} por ${formatoMoneda(suma(lista.map((o) => o.monto)))}.`,
    bloques: lista.length
      ? [
          {
            kind: 'table',
            titulo: `Ofertas en ${etapa}`,
            columnas: COLUMNAS_OFERTA,
            filas: lista.map((o) => ({ ...o })),
            pageSize: 8,
            accionFila: { label: 'Abrir', icon: 'arrowRight', send: 'Abre la oferta {id}' },
          },
        ]
      : [],
  }
}
