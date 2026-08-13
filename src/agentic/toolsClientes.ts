/**
 * Herramientas de consulta sobre clientes, productos y material de venta.
 */

import type { Block, RespuestaHerramienta } from './types'
import { fichaCliente, fichaOferta, tonoRiesgo, suma, COLUMNAS_OFERTA } from './tools'
import {
  clientes,
  ofertas,
  tareas,
  actividades,
  productos,
  playbooks,
  clientePorId,
  ofertaPorId,
  buscarClientes,
  diasHasta,
  formatoMoneda,
  formatoFecha,
  ETAPAS_ABIERTAS,
  YO,
  type Cliente,
} from './data'

/** Resuelve un cliente a partir de texto libre, tolerando frases completas. */
function resolverCliente(texto: string): Cliente | undefined {
  const q = texto.trim()
  if (!q) return undefined
  const directo = buscarClientes(q)[0]
  if (directo) return directo
  const cola = q.match(/\b(?:de|del|a|al|para|con|sobre|cliente)\s+(.{3,60})$/i)?.[1]
  return cola ? buscarClientes(cola.replace(/[?¿.!¡]/g, '').trim())[0] : undefined
}

// ── Búsqueda y ficha ─────────────────────────────────────────────────────────

export function buscar(args: { termino: string }): RespuestaHerramienta {
  const q = String(args.termino ?? '').trim()
  const porOferta = ofertaPorId(q.toUpperCase())
  if (porOferta) return abrirOferta({ ofertaId: porOferta.id })

  // Si la frase completa no coincide, reintenta con lo que sigue a la última
  // preposición: "abre la ficha de Grupo X" debe encontrar a "Grupo X".
  let encontrados = buscarClientes(q)
  if (!encontrados.length) {
    const cola = q.match(/\b(?:de|del|a|al|para|con|sobre|cliente)\s+(.{3,60})$/i)?.[1]
    if (cola) encontrados = buscarClientes(cola.replace(/[?¿.!¡]/g, '').trim())
  }

  if (!encontrados.length) {
    return {
      texto: `No encontré nada que coincida con "${q}". Puedo buscar por nombre, RFC, giro, ciudad o ID de oferta.`,
      bloques: [
        {
          kind: 'choices',
          titulo: 'Prueba con:',
          opciones: [
            { label: 'Clientes en riesgo de fuga', icon: 'alert', send: 'Muéstrame clientes en riesgo de fuga' },
            { label: 'Mi portafolio completo', icon: 'briefcase', send: '¿Cómo va mi portafolio?' },
          ],
        },
      ],
    }
  }

  if (encontrados.length === 1) return abrirCliente({ clienteId: encontrados[0]!.id })

  return {
    texto: `Encontré **${encontrados.length} clientes** que coinciden con "${q}". Elige uno para abrir su ficha completa.`,
    bloques: [
      {
        kind: 'records',
        layout: 'grid',
        items: encontrados.slice(0, 6).map((c) => tarjetaResumen(c)),
      },
    ],
  }
}

/** Versión compacta de la ficha, para listados. */
function tarjetaResumen(c: Cliente) {
  const abiertas = ofertas.filter((o) => o.clienteId === c.id && ETAPAS_ABIERTAS.includes(o.etapa))
  return {
    id: c.id,
    titulo: c.nombre,
    subtitulo: `${c.giro} · ${c.ciudad}`,
    avatar: c.nombre,
    badge: { texto: `Salud ${c.salud}`, tono: tonoRiesgo(c.riesgoFuga) },
    campos: [
      { label: 'Contacto', value: c.contacto, icono: 'user' },
      { label: 'Ofertas abiertas', value: `${abiertas.length} · ${formatoMoneda(suma(abiertas.map((o) => o.monto)))}`, icono: 'briefcase' },
      { label: 'Último contacto', value: formatoFecha(c.ultimoContacto), icono: 'clock' },
    ],
    acciones: [{ label: 'Abrir ficha', icon: 'arrowRight', variant: 'primary' as const, send: `Abre la ficha de ${c.nombre}` }],
  }
}

export function abrirCliente(args: { clienteId: string }): RespuestaHerramienta {
  const c = clientePorId(String(args.clienteId))
  if (!c) return { texto: 'No encontré ese cliente.' }

  const susOfertas = ofertas.filter((o) => o.clienteId === c.id)
  const abiertas = susOfertas.filter((o) => ETAPAS_ABIERTAS.includes(o.etapa))
  const pendientes = tareas.filter((t) => t.clienteId === c.id && t.estado === 'pendiente')
  const diasSinContacto = -diasHasta(c.ultimoContacto)

  const bloques: Block[] = [{ kind: 'record', item: fichaCliente(c) }]

  if (abiertas.length) {
    bloques.push({
      kind: 'table',
      titulo: 'Ofertas abiertas de este cliente',
      columnas: COLUMNAS_OFERTA.filter((col) => col.key !== 'cliente'),
      filas: abiertas.map((o) => ({ ...o })),
      accionFila: { label: 'Abrir', icon: 'arrowRight', send: 'Abre la oferta {id}' },
    })
  }

  if (pendientes.length) {
    bloques.push({
      kind: 'checklist',
      titulo: 'Tareas pendientes con este cliente',
      items: pendientes.map((t) => ({
        id: t.id,
        texto: t.titulo,
        detalle: `${t.tipo} · vence ${formatoFecha(t.vence)}`,
        hecho: false,
        meta: diasHasta(t.vence) < 0 ? 'vencida' : `en ${diasHasta(t.vence)} d`,
        tono: diasHasta(t.vence) < 0 ? ('negativo' as const) : ('neutro' as const),
      })),
    })
  }

  if (diasSinContacto > 45) {
    bloques.push({
      kind: 'note',
      tono: 'alerta',
      titulo: 'Señal de alerta',
      texto: `Llevas **${diasSinContacto} días sin contactar** a este cliente y su salud de relación es ${c.salud}/100. Los clientes con más de 45 días de silencio triplican su probabilidad de fuga.`,
    })
  }

  return {
    texto: `Aquí está **${c.nombre}**. Cliente desde hace ${Math.floor(c.antiguedadMeses / 12)} años, con ${abiertas.length} ofertas abiertas y ${pendientes.length} tareas pendientes.`,
    bloques,
    contexto: { tipo: 'cliente', id: c.id },
  }
}

export function abrirOferta(args: { ofertaId: string }): RespuestaHerramienta {
  const o = ofertaPorId(String(args.ofertaId).toUpperCase())
  if (!o) return { texto: `No encontré la oferta ${args.ofertaId}.` }

  const relacionadas = actividades.filter((a) => a.ofertaId === o.id).slice(0, 6)
  const bloques: Block[] = [{ kind: 'record', item: fichaOferta(o) }]

  if (relacionadas.length) {
    bloques.push({
      kind: 'timeline',
      titulo: 'Actividad de esta oferta',
      items: relacionadas.map((a) => ({ id: a.id, tipo: a.tipo, titulo: a.titulo, detalle: a.detalle, fecha: formatoFecha(a.fecha), autor: a.autor })),
    })
  }

  if (o.diasSinMover > 30 && ETAPAS_ABIERTAS.includes(o.etapa)) {
    bloques.push({
      kind: 'note',
      tono: 'alerta',
      titulo: 'Esta oferta está fría',
      texto: `Lleva **${o.diasSinMover} días** en etapa ${o.etapa}. La mediana de tu embudo en esa etapa es de 12 días. Vale la pena forzar una definición esta semana.`,
    })
  }

  return {
    texto: `Oferta **${o.id}** — ${o.producto} para ${o.cliente} por ${formatoMoneda(o.monto)}, en etapa ${o.etapa}.`,
    bloques,
    contexto: { tipo: 'oferta', id: o.id },
  }
}

// ── Clientes en riesgo ───────────────────────────────────────────────────────

export function clientesEnRiesgo(): RespuestaHerramienta {
  const lista = clientes
    .filter((c) => c.ejecutivo === YO && c.riesgoFuga !== 'bajo')
    .sort((a, b) => a.salud - b.salud)
    .slice(0, 8)

  return {
    texto: `**${lista.length} clientes de tu cartera muestran señales de fuga.** Los ordené del más frágil al menos frágil, combinando salud de relación, días sin contacto y NPS.`,
    bloques: [
      {
        kind: 'table',
        titulo: 'Cartera en riesgo',
        columnas: [
          { key: 'nombre', label: 'Cliente' },
          { key: 'giro', label: 'Giro' },
          { key: 'salud', label: 'Salud', format: 'percent', align: 'right' },
          { key: 'riesgoFuga', label: 'Riesgo', format: 'badge' },
          { key: 'nps', label: 'NPS', align: 'right' },
          { key: 'ultimoContacto', label: 'Último contacto', format: 'date' },
        ],
        filas: lista.map((c) => ({ ...c })),
        accionFila: { label: 'Abrir', icon: 'arrowRight', send: 'Abre la ficha de {nombre}' },
      },
      {
        kind: 'choices',
        opciones: [
          { label: 'Agendar llamada de retención al más frágil', icon: 'phone', variant: 'primary', run: { tool: 'form_nueva_tarea', args: { clienteId: lista[0]?.id } } },
          { label: '¿Qué le vendo al más frágil?', icon: 'sparkles', variant: 'secondary', send: `¿Qué producto le recomiendo a ${lista[0]?.nombre}?` },
        ],
      },
    ],
  }
}

// ── Recomendación de producto ────────────────────────────────────────────────

export function recomendarProducto(args: { clienteId?: string; nombre?: string }): RespuestaHerramienta {
  const c = args.clienteId ? clientePorId(String(args.clienteId)) : resolverCliente(String(args.nombre ?? ''))
  if (!c) return { texto: 'Necesito saber de qué cliente hablamos. Dime su nombre o su ID.' }

  const yaTiene = new Set(c.productos)
  const candidatos = productos
    .filter((p) => !yaTiene.has(p.nombre))
    .map((p) => {
      // Puntuación explicable: el agente debe poder justificar por qué recomienda.
      let score = 40
      const razones: string[] = []
      if (p.familia === 'Crédito' && c.facturacionAnual > 20_000_000) {
        score += 25
        razones.push(`factura ${formatoMoneda(c.facturacionAnual)} al año, cae holgadamente en política`)
      }
      if (p.familia === 'TPV' && ['Comercio al por mayor', 'Alimentos y bebidas', 'Turismo', 'Salud'].includes(c.giro)) {
        score += 30
        razones.push(`su giro (${c.giro}) opera con alto volumen de cobro con tarjeta`)
      }
      if (p.familia === 'Nómina' && c.tipo === 'PM' && c.facturacionAnual > 10_000_000) {
        score += 22
        razones.push('es persona moral con plantilla suficiente para dispersión')
      }
      if (p.familia === 'Seguros' && ['Manufactura', 'Construcción', 'Agroindustria'].includes(c.giro)) {
        score += 24
        razones.push('concentra activos físicos asegurables en su operación')
      }
      if (p.familia === 'TDC' && c.saldoPromedio > 800_000) {
        score += 18
        razones.push('mantiene saldo promedio alto, buen perfil de línea revolvente')
      }
      if (c.antiguedadMeses > 36) {
        score += 8
        razones.push(`${Math.floor(c.antiguedadMeses / 12)} años de relación`)
      }
      if (c.salud < 50) score -= 12
      return { p, score: Math.min(97, score), razones }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const top = candidatos[0]!

  return {
    texto: `Para **${c.nombre}** la mejor siguiente venta es **${top.p.nombre}** (afinidad ${top.score}%). ${top.razones.length ? 'Lo recomiendo porque ' + top.razones.join(', ') + '.' : ''}`,
    bloques: [
      {
        kind: 'compare',
        titulo: 'Las tres mejores opciones para este cliente',
        encabezados: ['Criterio', ...candidatos.map((x) => x.p.nombre)],
        filas: [
          { label: 'Afinidad', valores: candidatos.map((x) => `${x.score}%`), destacar: 0 },
          { label: 'Familia', valores: candidatos.map((x) => x.p.familia) },
          { label: 'Tasa / costo', valores: candidatos.map((x) => x.p.tasa) },
          { label: 'Monto', valores: candidatos.map((x) => (x.p.montoMax ? `${formatoMoneda(x.p.montoMin)} – ${formatoMoneda(x.p.montoMax)}` : 'Sin monto fijo')) },
          { label: 'Plazo', valores: candidatos.map((x) => x.p.plazo) },
          { label: 'Ideal para', valores: candidatos.map((x) => x.p.ideal) },
        ],
        acciones: candidatos.map((x, i) => ({
          label: `Crear oferta de ${x.p.nombre}`,
          icon: 'plus',
          variant: i === 0 ? ('primary' as const) : ('secondary' as const),
          run: { tool: 'form_nueva_oferta', args: { clienteId: c.id, producto: x.p.nombre } },
        })),
      },
      {
        kind: 'note',
        tono: 'neutro',
        titulo: `Cómo abrir la conversación de ${top.p.nombre}`,
        texto: `"${top.p.pitch}" — Requisitos que debes validar antes de prometer nada: ${top.p.requisitos.join('; ')}.`,
      },
    ],
    contexto: { tipo: 'cliente', id: c.id },
  }
}

// ── Ficha de producto ────────────────────────────────────────────────────────

export function verProducto(args: { nombre: string }): RespuestaHerramienta {
  const q = String(args.nombre).toLowerCase()
  const p = productos.find((x) => x.nombre.toLowerCase().includes(q) || x.familia.toLowerCase() === q)
  if (!p) {
    return {
      texto: 'No identifiqué el producto. Estos son los que manejo:',
      bloques: [
        {
          kind: 'choices',
          opciones: productos.map((x) => ({ label: x.nombre, icon: 'package', send: `Háblame del producto ${x.nombre}` })),
        },
      ],
    }
  }

  return {
    texto: `**${p.nombre}** — ${p.pitch}`,
    bloques: [
      {
        kind: 'kpis',
        items: [
          { etiqueta: 'Tasa', valor: p.tasa, icono: 'percent', tono: 'neutro' },
          { etiqueta: 'Comisión', valor: p.comision, icono: 'wallet', tono: 'neutro' },
          { etiqueta: 'Plazo', valor: p.plazo, icono: 'calendar', tono: 'neutro' },
          { etiqueta: 'Monto', valor: p.montoMax ? `hasta ${formatoMoneda(p.montoMax)}` : 'Sin monto fijo', icono: 'trending', tono: 'positivo' },
        ],
      },
      {
        kind: 'checklist',
        titulo: 'Requisitos para armar el expediente',
        subtitulo: 'Marca lo que ya tienes del cliente',
        items: p.requisitos.map((r, i) => ({ id: `${p.id}-req-${i}`, texto: r, hecho: false })),
      },
      {
        kind: 'note',
        tono: 'positivo',
        titulo: 'Argumentos de venta',
        texto: p.beneficios.map((b) => `- ${b}`).join('\n'),
      },
      {
        kind: 'choices',
        opciones: [
          { label: 'Crear oferta con este producto', icon: 'plus', variant: 'primary', run: { tool: 'form_nueva_oferta', args: { producto: p.nombre } } },
          { label: 'Ver objeciones frecuentes', icon: 'book', variant: 'secondary', send: 'Muéstrame el playbook de objeciones' },
        ],
      },
    ],
  }
}

// ── Playbook / flash cards ───────────────────────────────────────────────────

export function verPlaybook(args: { categoria?: string } = {}): RespuestaHerramienta {
  const cat = args.categoria ? String(args.categoria).toLowerCase() : null
  const cards = cat ? playbooks.filter((p) => p.categoria.toLowerCase().includes(cat)) : playbooks
  const lista = cards.length ? cards : playbooks

  return {
    texto: `Aquí tienes **${lista.length} tarjetas de entrenamiento**. Toca cualquiera para ver la respuesta recomendada.`,
    bloques: [
      { kind: 'flashcards', titulo: 'Playbook de venta', cards: lista.map((p) => ({ id: p.id, categoria: p.categoria, frente: p.frente, reverso: p.reverso, tip: p.tip })) },
      {
        kind: 'choices',
        titulo: 'Filtrar por tipo',
        opciones: [
          { label: 'Objeciones', icon: 'shield', send: 'Playbook de objeciones' },
          { label: 'Descubrimiento', icon: 'search', send: 'Playbook de descubrimiento' },
          { label: 'Cierre', icon: 'trophy', send: 'Playbook de cierre' },
          { label: 'Cumplimiento', icon: 'file', send: 'Playbook de cumplimiento' },
        ],
      },
    ],
  }
}

// ── Historial ────────────────────────────────────────────────────────────────

export function verHistorial(args: { clienteId?: string; nombre?: string }): RespuestaHerramienta {
  const c = args.clienteId ? clientePorId(String(args.clienteId)) : resolverCliente(String(args.nombre ?? ''))
  if (!c) return { texto: '¿De qué cliente quieres el historial?' }

  const items = actividades.filter((a) => a.clienteId === c.id).slice(0, 12)

  return {
    texto: `Historial de **${c.nombre}**: ${items.length} interacciones registradas, la más reciente el ${items[0] ? formatoFecha(items[0].fecha) : '—'}.`,
    bloques: [
      {
        kind: 'timeline',
        titulo: `Línea de tiempo · ${c.nombre}`,
        items: items.map((a) => ({ id: a.id, tipo: a.tipo, titulo: a.titulo, detalle: a.detalle, fecha: formatoFecha(a.fecha), autor: a.autor })),
      },
      {
        kind: 'choices',
        opciones: [
          { label: 'Registrar una interacción', icon: 'edit', variant: 'primary', run: { tool: 'form_registrar_actividad', args: { clienteId: c.id } } },
          { label: 'Ver ficha completa', icon: 'building', variant: 'secondary', send: `Abre la ficha de ${c.nombre}` },
        ],
      },
    ],
    contexto: { tipo: 'cliente', id: c.id },
  }
}

// ── Analítica ────────────────────────────────────────────────────────────────

export function analizarCierres(): RespuestaHerramienta {
  const mias = ofertas.filter((o) => o.ejecutivo === YO)
  const porFamilia = [...new Set(mias.map((o) => o.familia))].map((f) => {
    const g = mias.filter((o) => o.familia === f)
    const ganadas = g.filter((o) => o.etapa === 'Ganada')
    const cerradas = g.filter((o) => o.etapa === 'Ganada' || o.etapa === 'Perdida')
    return {
      familia: f,
      total: g.length,
      ganadas: ganadas.length,
      montoGanado: suma(ganadas.map((o) => o.monto)),
      tasa: cerradas.length ? Math.round((ganadas.length / cerradas.length) * 100) : 0,
    }
  }).sort((a, b) => b.montoGanado - a.montoGanado)

  const mejor = porFamilia[0]
  const peor = [...porFamilia].sort((a, b) => a.tasa - b.tasa)[0]

  return {
    texto: `Tu producto más rentable es **${mejor?.familia}** con ${formatoMoneda(mejor?.montoGanado ?? 0)} ganados. Donde más se te cae el embudo es en **${peor?.familia}**, con apenas ${peor?.tasa}% de cierre — ahí es donde conviene revisar el discurso.`,
    bloques: [
      {
        kind: 'chart',
        variante: 'bar',
        titulo: 'Monto ganado por familia de producto',
        unidad: 'money',
        series: porFamilia.map((f) => ({ label: f.familia, value: f.montoGanado })),
        pie: 'Sólo ofertas en etapa Ganada',
      },
      {
        kind: 'table',
        titulo: 'Efectividad por familia',
        columnas: [
          { key: 'familia', label: 'Familia' },
          { key: 'total', label: 'Ofertas', align: 'right' },
          { key: 'ganadas', label: 'Ganadas', align: 'right' },
          { key: 'tasa', label: 'Tasa de cierre', format: 'percent', align: 'right' },
          { key: 'montoGanado', label: 'Monto ganado', format: 'money', align: 'right' },
        ],
        filas: porFamilia,
      },
      {
        kind: 'note',
        tono: 'neutro',
        titulo: 'Lectura del dato',
        texto: `Con ${peor?.total} ofertas de ${peor?.familia} y sólo ${peor?.tasa}% de cierre, cada intento te cuesta tiempo que rinde más en ${mejor?.familia}. Antes de bajar el precio, revisa si el problema es de perfilamiento: estás llevando el producto a clientes que no lo necesitan.`,
      },
    ],
  }
}
