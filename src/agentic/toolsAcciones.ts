/**
 * Herramientas que escriben en el CRM.
 *
 * Regla de la demo: ninguna escritura ocurre sin que el usuario haya visto
 * antes un formulario o una tarjeta de confirmación con el detalle exacto de lo
 * que va a cambiar. Es el patrón de "human in the loop" que separa un agente
 * usable de uno en el que nadie confía.
 */

import type { Block, RespuestaHerramienta, CampoFormulario } from './types'
import { fichaOferta } from './tools'
import {
  clientes,
  ofertas,
  tareas,
  actividades,
  productos,
  clientePorId,
  ofertaPorId,
  diasHasta,
  formatoMoneda,
  formatoFecha,
  ETAPAS_ABIERTAS,
  ETAPAS,
  YO,
  HOY,
  type Etapa,
  type Oferta,
  type TipoTarea,
  type Prioridad,
  type Familia,
} from './data'

const isoHoy = () => HOY.toISOString().slice(0, 10)
const isoEnDias = (d: number) => {
  const f = new Date(HOY)
  f.setDate(f.getDate() + d)
  return f.toISOString().slice(0, 10)
}

const opcionesCliente = () =>
  clientes
    .filter((c) => c.ejecutivo === YO)
    .slice(0, 30)
    .map((c) => ({ label: c.nombre, value: c.id }))

const opcionesProducto = () => productos.map((p) => ({ label: `${p.nombre} (${p.familia})`, value: p.nombre }))

// ── Formularios generados por el agente ──────────────────────────────────────

export function formNuevaOferta(args: { clienteId?: string; producto?: string; monto?: number } = {}): RespuestaHerramienta {
  const c = args.clienteId ? clientePorId(String(args.clienteId)) : undefined
  const campos: CampoFormulario[] = [
    {
      name: 'clienteId',
      label: 'Cliente',
      type: 'select',
      value: c?.id ?? opcionesCliente()[0]?.value,
      options: opcionesCliente(),
      required: true,
      width: 'full',
    },
    {
      name: 'producto',
      label: 'Producto',
      type: 'select',
      value: args.producto ?? opcionesProducto()[0]?.value,
      options: opcionesProducto(),
      required: true,
      width: 'full',
    },
    { name: 'monto', label: 'Monto de la oferta', type: 'money', value: args.monto ?? 500000, required: true, width: 'half', hint: 'En pesos mexicanos' },
    {
      name: 'etapa',
      label: 'Etapa inicial',
      type: 'segmented',
      value: 'Contactado',
      options: ETAPAS_ABIERTAS.slice(0, 4).map((e) => ({ label: e, value: e })),
      width: 'half',
    },
    { name: 'fechaCierre', label: 'Cierre estimado', type: 'date', value: isoEnDias(30), required: true, width: 'half' },
    { name: 'probabilidad', label: 'Probabilidad de cierre', type: 'slider', value: 40, min: 0, max: 100, step: 5, width: 'half' },
    {
      name: 'campana',
      label: 'Origen',
      type: 'select',
      value: 'Referencia propia',
      options: ['Referencia propia', 'Campaña Cross-Sell PyMEs', 'Campaña Upgrade TDC', 'Portal web', 'Evento Expo Industrial'].map((x) => ({ label: x, value: x })),
      width: 'full',
    },
    { name: 'notas', label: 'Contexto de la oferta', type: 'textarea', placeholder: '¿Qué detonó esta oferta? ¿Qué necesita el cliente?', width: 'full' },
  ]

  return {
    texto: c
      ? `Te preparé el alta de oferta para **${c.nombre}**. Revisa los campos y ajústalos antes de crearla.`
      : 'Llena estos datos y creo la oferta. Precargué los valores más comunes para que sólo ajustes lo necesario.',
    bloques: [
      {
        kind: 'form',
        form: {
          id: 'nueva-oferta',
          titulo: 'Nueva oferta',
          subtitulo: 'Los cambios se aplican al CRM al confirmar',
          icono: 'briefcase',
          campos,
          submitLabel: 'Crear oferta',
          tool: 'crear_oferta',
        },
      },
    ],
  }
}

export function formEditarOferta(args: { ofertaId: string }): RespuestaHerramienta {
  const o = ofertaPorId(String(args.ofertaId).toUpperCase())
  if (!o) return { texto: 'No encontré esa oferta.' }

  return {
    texto: `Edita lo que necesites de **${o.id}**. Te muestro los valores actuales.`,
    bloques: [
      {
        kind: 'form',
        form: {
          id: `editar-${o.id}`,
          titulo: `Editar ${o.id}`,
          subtitulo: `${o.producto} · ${o.cliente}`,
          icono: 'edit',
          campos: [
            { name: 'monto', label: 'Monto', type: 'money', value: o.monto, required: true, width: 'half' },
            { name: 'etapa', label: 'Etapa', type: 'select', value: o.etapa, options: ETAPAS.map((e) => ({ label: e, value: e })), width: 'half' },
            { name: 'probabilidad', label: 'Probabilidad', type: 'slider', value: o.probabilidad, min: 0, max: 100, step: 5, width: 'full' },
            { name: 'fechaCierre', label: 'Cierre estimado', type: 'date', value: o.fechaCierre, width: 'half' },
            { name: 'producto', label: 'Producto', type: 'select', value: o.producto, options: opcionesProducto(), width: 'half' },
            { name: 'notas', label: 'Notas', type: 'textarea', value: o.notas, width: 'full' },
          ],
          submitLabel: 'Guardar cambios',
          tool: 'guardar_oferta',
          args: { ofertaId: o.id },
        },
      },
    ],
    contexto: { tipo: 'oferta', id: o.id },
  }
}

export function formNuevaTarea(args: { clienteId?: string; ofertaId?: string } = {}): RespuestaHerramienta {
  const o = args.ofertaId ? ofertaPorId(String(args.ofertaId)) : undefined
  const c = args.clienteId ? clientePorId(String(args.clienteId)) : o ? clientePorId(o.clienteId) : undefined

  return {
    texto: c ? `Agendemos el siguiente paso con **${c.nombre}**.` : 'Dime qué tarea agendo y para cuándo.',
    bloques: [
      {
        kind: 'form',
        form: {
          id: 'nueva-tarea',
          titulo: 'Agendar tarea',
          subtitulo: c ? `${c.nombre}${o ? ` · ${o.id}` : ''}` : undefined,
          icono: 'calendar',
          campos: [
            {
              name: 'tipo',
              label: 'Tipo',
              type: 'segmented',
              value: 'llamada',
              options: [
                { label: 'Llamada', value: 'llamada' },
                { label: 'Visita', value: 'visita' },
                { label: 'Correo', value: 'correo' },
                { label: 'Documento', value: 'documento' },
              ],
              width: 'full',
            },
            { name: 'titulo', label: '¿Qué hay que hacer?', type: 'text', value: c ? `Dar seguimiento a ${c.nombre}` : '', required: true, width: 'full' },
            { name: 'vence', label: 'Fecha límite', type: 'date', value: isoEnDias(2), required: true, width: 'half' },
            {
              name: 'prioridad',
              label: 'Prioridad',
              type: 'segmented',
              value: 'alta',
              options: [
                { label: 'Alta', value: 'alta' },
                { label: 'Media', value: 'media' },
                { label: 'Baja', value: 'baja' },
              ],
              width: 'half',
            },
            { name: 'nota', label: 'Nota para ti mismo', type: 'textarea', placeholder: 'Qué quieres lograr en este contacto', width: 'full' },
          ],
          submitLabel: 'Agendar',
          tool: 'crear_tarea',
          args: { clienteId: c?.id, ofertaId: o?.id },
        },
      },
    ],
  }
}

export function formRegistrarActividad(args: { clienteId?: string } = {}): RespuestaHerramienta {
  const c = args.clienteId ? clientePorId(String(args.clienteId)) : undefined
  return {
    texto: c ? `Registremos lo que pasó con **${c.nombre}**.` : '¿Con qué cliente fue la interacción?',
    bloques: [
      {
        kind: 'form',
        form: {
          id: 'registrar-actividad',
          titulo: 'Registrar interacción',
          icono: 'history',
          campos: [
            { name: 'clienteId', label: 'Cliente', type: 'select', value: c?.id ?? opcionesCliente()[0]?.value, options: opcionesCliente(), required: true, width: 'full' },
            {
              name: 'tipo',
              label: 'Tipo',
              type: 'segmented',
              value: 'llamada',
              options: [
                { label: 'Llamada', value: 'llamada' },
                { label: 'Correo', value: 'correo' },
                { label: 'Reunión', value: 'reunion' },
                { label: 'Nota', value: 'nota' },
              ],
              width: 'full',
            },
            { name: 'titulo', label: 'Resumen', type: 'text', required: true, placeholder: 'Ej. Llamada para revisar propuesta', width: 'full' },
            { name: 'detalle', label: '¿Qué se acordó?', type: 'textarea', placeholder: 'Compromisos, objeciones, siguiente paso', width: 'full' },
          ],
          submitLabel: 'Guardar en el historial',
          tool: 'crear_actividad',
        },
      },
    ],
  }
}

// ── Confirmaciones ───────────────────────────────────────────────────────────

export function confirmarAvance(args: { ofertaId: string }): RespuestaHerramienta {
  const o = ofertaPorId(String(args.ofertaId).toUpperCase())
  if (!o) return { texto: 'No encontré esa oferta.' }

  const idx = ETAPAS.indexOf(o.etapa)
  const siguiente = ETAPAS[Math.min(idx + 1, 5)] as Etapa
  if (!ETAPAS_ABIERTAS.includes(o.etapa)) return { texto: `La oferta ${o.id} ya está cerrada como ${o.etapa}.` }

  const nuevaProb = siguiente === 'Ganada' ? 100 : Math.min(95, o.probabilidad + 20)

  return {
    texto: `Voy a mover **${o.id}** de ${o.etapa} a ${siguiente}. Confirma antes de que lo aplique.`,
    bloques: [
      {
        kind: 'confirm',
        confirm: {
          titulo: `Avanzar ${o.id} a ${siguiente}`,
          resumen: `${o.producto} para ${o.cliente} por ${formatoMoneda(o.monto)}.`,
          cambios: [
            { label: 'Etapa', antes: o.etapa, despues: siguiente },
            { label: 'Probabilidad', antes: `${o.probabilidad}%`, despues: `${nuevaProb}%` },
            { label: 'Días sin movimiento', antes: `${o.diasSinMover} días`, despues: '0 días' },
          ],
          advertencia: siguiente === 'Ganada' ? 'Marcar como Ganada dispara el alta en formalización y ya no podrás editar el monto.' : undefined,
          confirmLabel: `Sí, mover a ${siguiente}`,
          tool: 'aplicar_avance',
          args: { ofertaId: o.id, etapa: siguiente, probabilidad: nuevaProb },
        },
      },
    ],
    contexto: { tipo: 'oferta', id: o.id },
  }
}

export function confirmarPerdida(args: { ofertaId: string }): RespuestaHerramienta {
  const o = ofertaPorId(String(args.ofertaId).toUpperCase())
  if (!o) return { texto: 'No encontré esa oferta.' }

  return {
    texto: `Antes de darla por perdida, confirma. Esto saca ${formatoMoneda(o.monto)} de tu pronóstico.`,
    bloques: [
      {
        kind: 'confirm',
        confirm: {
          titulo: `Marcar ${o.id} como perdida`,
          resumen: `${o.producto} para ${o.cliente}.`,
          cambios: [
            { label: 'Etapa', antes: o.etapa, despues: 'Perdida' },
            { label: 'Probabilidad', antes: `${o.probabilidad}%`, despues: '0%' },
            { label: 'Pronóstico del mes', antes: formatoMoneda(o.monto), despues: formatoMoneda(0) },
          ],
          advertencia: 'Las ofertas perdidas no se pueden reabrir; habría que dar de alta una nueva.',
          confirmLabel: 'Sí, marcar perdida',
          tool: 'aplicar_perdida',
          args: { ofertaId: o.id },
        },
      },
    ],
  }
}

export function confirmarSeguimientoMasivo(args: { ids: string[] }): RespuestaHerramienta {
  const lista = (args.ids ?? []).map((id) => ofertaPorId(String(id))).filter(Boolean) as Oferta[]
  if (!lista.length) return { texto: 'No hay ofertas que agendar.' }

  return {
    texto: `Voy a agendar **${lista.length} llamadas de seguimiento** para mañana. Revisa la lista.`,
    bloques: [
      {
        kind: 'confirm',
        confirm: {
          titulo: `Agendar ${lista.length} seguimientos`,
          resumen: `Se crearán ${lista.length} tareas de llamada con vencimiento ${formatoFecha(isoEnDias(1))} y prioridad alta.`,
          cambios: lista.map((o) => ({ label: o.cliente, despues: `Llamada por ${o.id} · ${formatoMoneda(o.monto)}` })),
          confirmLabel: 'Agendar las tareas',
          tool: 'aplicar_seguimiento_masivo',
          args: { ids: lista.map((o) => o.id) },
        },
      },
    ],
  }
}

// ── Mutaciones ───────────────────────────────────────────────────────────────

export function crearOferta(args: Record<string, unknown>): RespuestaHerramienta {
  const c = clientePorId(String(args.clienteId))
  if (!c) return { texto: 'Falta indicar el cliente.' }
  const prodNombre = String(args.producto)
  const prod = productos.find((p) => p.nombre === prodNombre)

  const nueva: Oferta = {
    id: `OF-${1001 + ofertas.length}`,
    clienteId: c.id,
    cliente: c.nombre,
    producto: prodNombre,
    familia: (prod?.familia ?? 'Crédito') as Familia,
    monto: Number(args.monto) || 0,
    etapa: (String(args.etapa || 'Contactado') as Etapa),
    probabilidad: Number(args.probabilidad) || 40,
    fechaAlta: isoHoy(),
    fechaCierre: String(args.fechaCierre || isoEnDias(30)),
    ejecutivo: YO,
    campana: String(args.campana || 'Referencia propia'),
    notas: String(args.notas || 'Alta creada desde el agente.'),
    diasSinMover: 0,
  }
  ofertas.push(nueva)

  actividades.unshift({
    id: `ACT-${Date.now()}`,
    clienteId: c.id,
    ofertaId: nueva.id,
    tipo: 'sistema',
    titulo: 'Oferta creada',
    detalle: `${nueva.producto} por ${formatoMoneda(nueva.monto)} en etapa ${nueva.etapa}.`,
    fecha: isoHoy(),
    autor: YO,
  })

  return {
    texto: `Listo. Creé la oferta **${nueva.id}** para ${c.nombre}.`,
    bloques: [
      {
        kind: 'result',
        tono: 'success',
        titulo: `Oferta ${nueva.id} creada`,
        detalle: `${nueva.producto} por ${formatoMoneda(nueva.monto)}, etapa ${nueva.etapa}, cierre estimado ${formatoFecha(nueva.fechaCierre)}.`,
        campos: [
          { label: 'Cliente', value: c.nombre },
          { label: 'Ejecutivo', value: YO },
          { label: 'Probabilidad', value: `${nueva.probabilidad}%` },
          { label: 'Origen', value: nueva.campana },
        ],
        acciones: [
          { label: 'Agendar primer contacto', icon: 'calendar', variant: 'primary', run: { tool: 'form_nueva_tarea', args: { ofertaId: nueva.id, clienteId: c.id } } },
          { label: 'Ver la oferta', icon: 'briefcase', variant: 'secondary', send: `Abre la oferta ${nueva.id}` },
        ],
      },
    ],
    registro: { titulo: `Oferta ${nueva.id} creada`, detalle: `${c.nombre} · ${formatoMoneda(nueva.monto)}` },
    contexto: { tipo: 'oferta', id: nueva.id },
  }
}

export function guardarOferta(args: Record<string, unknown>): RespuestaHerramienta {
  const o = ofertaPorId(String(args.ofertaId))
  if (!o) return { texto: 'No encontré esa oferta.' }

  const antes = { monto: o.monto, etapa: o.etapa, probabilidad: o.probabilidad }
  o.monto = Number(args.monto) || o.monto
  o.etapa = (String(args.etapa || o.etapa) as Etapa)
  o.probabilidad = Number(args.probabilidad)
  o.fechaCierre = String(args.fechaCierre || o.fechaCierre)
  o.producto = String(args.producto || o.producto)
  o.notas = String(args.notas || o.notas)
  o.diasSinMover = 0

  const cambios = [
    antes.monto !== o.monto ? { label: 'Monto', value: `${formatoMoneda(antes.monto)} → ${formatoMoneda(o.monto)}` } : null,
    antes.etapa !== o.etapa ? { label: 'Etapa', value: `${antes.etapa} → ${o.etapa}` } : null,
    antes.probabilidad !== o.probabilidad ? { label: 'Probabilidad', value: `${antes.probabilidad}% → ${o.probabilidad}%` } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return {
    texto: `Guardé los cambios de **${o.id}**.`,
    bloques: [
      {
        kind: 'result',
        tono: 'success',
        titulo: 'Cambios guardados',
        detalle: cambios.length ? undefined : 'No modificaste ningún campo con impacto en el pronóstico.',
        campos: cambios,
        acciones: [{ label: 'Ver la oferta', icon: 'briefcase', variant: 'secondary', send: `Abre la oferta ${o.id}` }],
      },
    ],
    registro: { titulo: `Oferta ${o.id} actualizada`, detalle: cambios.map((c) => `${c.label}: ${c.value}`).join(' · ') || 'Sin cambios mayores' },
  }
}

export function aplicarAvance(args: Record<string, unknown>): RespuestaHerramienta {
  const o = ofertaPorId(String(args.ofertaId))
  if (!o) return { texto: 'No encontré esa oferta.' }
  const antes = o.etapa
  o.etapa = String(args.etapa) as Etapa
  o.probabilidad = Number(args.probabilidad)
  o.diasSinMover = 0

  actividades.unshift({
    id: `ACT-${Date.now()}`,
    clienteId: o.clienteId,
    ofertaId: o.id,
    tipo: 'sistema',
    titulo: 'Cambio de etapa',
    detalle: `${antes} → ${o.etapa}, aplicado desde el agente.`,
    fecha: isoHoy(),
    autor: YO,
  })

  const ganada = o.etapa === 'Ganada'
  return {
    texto: ganada
      ? `¡Cerrada! **${o.id}** quedó como Ganada por ${formatoMoneda(o.monto)}.`
      : `Moví **${o.id}** a ${o.etapa}.`,
    bloques: [
      {
        kind: 'result',
        tono: 'success',
        titulo: ganada ? `Oferta ganada · ${formatoMoneda(o.monto)}` : `${o.id} ahora está en ${o.etapa}`,
        detalle: `${o.producto} para ${o.cliente}.`,
        campos: [
          { label: 'Etapa anterior', value: antes },
          { label: 'Etapa actual', value: o.etapa },
          { label: 'Probabilidad', value: `${o.probabilidad}%` },
        ],
        acciones: ganada
          ? [{ label: 'Buscar la siguiente venta', icon: 'sparkles', variant: 'primary', send: `¿Qué producto le recomiendo a ${o.cliente}?` }]
          : [{ label: 'Agendar siguiente paso', icon: 'calendar', variant: 'primary', run: { tool: 'form_nueva_tarea', args: { ofertaId: o.id, clienteId: o.clienteId } } }],
      },
    ],
    registro: { titulo: `${o.id}: ${antes} → ${o.etapa}`, detalle: `${o.cliente} · ${formatoMoneda(o.monto)}` },
    contexto: { tipo: 'oferta', id: o.id },
  }
}

export function aplicarPerdida(args: Record<string, unknown>): RespuestaHerramienta {
  const o = ofertaPorId(String(args.ofertaId))
  if (!o) return { texto: 'No encontré esa oferta.' }
  const antes = o.etapa
  o.etapa = 'Perdida'
  o.probabilidad = 0

  return {
    texto: `Marqué **${o.id}** como perdida. Registré el motivo para el análisis de fuga.`,
    bloques: [
      {
        kind: 'result',
        tono: 'info',
        titulo: `${o.id} marcada como perdida`,
        detalle: `Salió ${formatoMoneda(o.monto)} de tu pronóstico. Estaba en etapa ${antes}.`,
        acciones: [
          { label: 'Ver por qué se pierden mis ofertas', icon: 'chart', variant: 'secondary', send: '¿Cómo van mis cierres por producto?' },
          { label: 'Recuperar al cliente con otra oferta', icon: 'sparkles', variant: 'primary', send: `¿Qué producto le recomiendo a ${o.cliente}?` },
        ],
      },
    ],
    registro: { titulo: `${o.id} marcada como perdida`, detalle: `${o.cliente} · ${formatoMoneda(o.monto)}` },
  }
}

export function crearTarea(args: Record<string, unknown>): RespuestaHerramienta {
  const c = args.clienteId ? clientePorId(String(args.clienteId)) : undefined
  const nueva = {
    id: `TAR-${String(tareas.length + 1).padStart(3, '0')}`,
    titulo: String(args.titulo || 'Seguimiento'),
    tipo: (String(args.tipo || 'llamada') as TipoTarea),
    clienteId: c?.id,
    ofertaId: args.ofertaId ? String(args.ofertaId) : undefined,
    vence: String(args.vence || isoEnDias(2)),
    prioridad: (String(args.prioridad || 'alta') as Prioridad),
    estado: 'pendiente' as const,
    responsable: YO,
    nota: args.nota ? String(args.nota) : undefined,
  }
  tareas.push(nueva)

  return {
    texto: `Agendado. **${nueva.titulo}** para el ${formatoFecha(nueva.vence)}.`,
    bloques: [
      {
        kind: 'result',
        tono: 'success',
        titulo: 'Tarea agendada',
        detalle: nueva.nota,
        campos: [
          { label: 'Tarea', value: nueva.titulo },
          { label: 'Tipo', value: nueva.tipo },
          { label: 'Vence', value: `${formatoFecha(nueva.vence)} (en ${diasHasta(nueva.vence)} días)` },
          { label: 'Prioridad', value: nueva.prioridad },
          ...(c ? [{ label: 'Cliente', value: c.nombre }] : []),
        ],
        acciones: [{ label: 'Ver mi agenda', icon: 'calendar', variant: 'secondary', send: 'Arma mi plan del día' }],
      },
    ],
    registro: { titulo: 'Tarea agendada', detalle: `${nueva.titulo} · ${formatoFecha(nueva.vence)}` },
  }
}

export function crearActividad(args: Record<string, unknown>): RespuestaHerramienta {
  const c = clientePorId(String(args.clienteId))
  if (!c) return { texto: 'Falta el cliente.' }

  actividades.unshift({
    id: `ACT-${Date.now()}`,
    clienteId: c.id,
    tipo: String(args.tipo || 'nota') as 'llamada' | 'correo' | 'reunion' | 'nota',
    titulo: String(args.titulo || 'Interacción'),
    detalle: String(args.detalle || ''),
    fecha: isoHoy(),
    autor: YO,
  })
  c.ultimoContacto = isoHoy()
  c.salud = Math.min(100, c.salud + 4)

  return {
    texto: `Registrado en el historial de **${c.nombre}**. Su salud de relación subió a ${c.salud}.`,
    bloques: [
      {
        kind: 'result',
        tono: 'success',
        titulo: 'Interacción registrada',
        detalle: String(args.detalle || ''),
        campos: [
          { label: 'Cliente', value: c.nombre },
          { label: 'Salud de relación', value: `${c.salud}/100 (+4)` },
          { label: 'Último contacto', value: 'hoy' },
        ],
        acciones: [
          { label: 'Agendar siguiente paso', icon: 'calendar', variant: 'primary', run: { tool: 'form_nueva_tarea', args: { clienteId: c.id } } },
          { label: 'Ver historial', icon: 'history', variant: 'secondary', send: `Muéstrame el historial de ${c.nombre}` },
        ],
      },
    ],
    registro: { titulo: 'Interacción registrada', detalle: `${c.nombre} · ${String(args.titulo || '')}` },
    contexto: { tipo: 'cliente', id: c.id },
  }
}

export function aplicarSeguimientoMasivo(args: Record<string, unknown>): RespuestaHerramienta {
  const ids = (args.ids as string[]) ?? []
  const creadas: string[] = []
  for (const id of ids) {
    const o = ofertaPorId(id)
    if (!o) continue
    const t = {
      id: `TAR-${String(tareas.length + 1).padStart(3, '0')}`,
      titulo: `Llamar a ${o.cliente} por ${o.id}`,
      tipo: 'llamada' as TipoTarea,
      clienteId: o.clienteId,
      ofertaId: o.id,
      vence: isoEnDias(1),
      prioridad: 'alta' as Prioridad,
      estado: 'pendiente' as const,
      responsable: YO,
      nota: `Oferta estancada ${o.diasSinMover} días en ${o.etapa}.`,
    }
    tareas.push(t)
    creadas.push(`${o.cliente} — ${formatoMoneda(o.monto)}`)
  }

  return {
    texto: `Agendé **${creadas.length} llamadas** para mañana. Bloquéate una hora en la mañana y las sacas de corrido.`,
    bloques: [
      {
        kind: 'result',
        tono: 'success',
        titulo: `${creadas.length} seguimientos agendados`,
        detalle: `Todas vencen el ${formatoFecha(isoEnDias(1))} con prioridad alta.`,
        campos: creadas.map((c, i) => ({ label: `Llamada ${i + 1}`, value: c })),
        acciones: [{ label: 'Ver mi plan del día', icon: 'calendar', variant: 'primary', send: 'Arma mi plan del día' }],
      },
    ],
    registro: { titulo: `${creadas.length} seguimientos agendados`, detalle: creadas.join(' · ') },
  }
}

export function completarTarea(args: Record<string, unknown>): RespuestaHerramienta {
  const t = tareas.find((x) => x.id === String(args.tareaId))
  if (!t) return { texto: 'No encontré esa tarea.' }
  t.estado = 'hecha'
  return {
    texto: `Marqué **${t.titulo}** como completada.`,
    bloques: [{ kind: 'result', tono: 'success', titulo: 'Tarea completada', detalle: t.titulo }],
    registro: { titulo: 'Tarea completada', detalle: t.titulo },
  }
}

// ── Plan del día ─────────────────────────────────────────────────────────────

export function planDelDia(): RespuestaHerramienta {
  const pendientes = tareas
    .filter((t) => t.responsable === YO && t.estado === 'pendiente' && diasHasta(t.vence) <= 1)
    .sort((a, b) => (a.vence < b.vence ? -1 : 1))

  const calientes = ofertas
    .filter((o) => o.ejecutivo === YO && ETAPAS_ABIERTAS.includes(o.etapa) && o.probabilidad >= 60)
    .sort((a, b) => b.monto * b.probabilidad - a.monto * a.probabilidad)
    .slice(0, 3)

  const frios = clientes
    .filter((c) => c.ejecutivo === YO && -diasHasta(c.ultimoContacto) > 60)
    .sort((a, b) => a.salud - b.salud)
    .slice(0, 3)

  const vencidas = pendientes.filter((t) => diasHasta(t.vence) < 0)

  const bloques: Block[] = [
    {
      kind: 'kpis',
      items: [
        { etiqueta: 'Tareas para hoy', valor: String(pendientes.length), detalle: `${vencidas.length} ya vencidas`, icono: 'check', tono: vencidas.length ? 'negativo' : 'positivo' },
        { etiqueta: 'Ofertas calientes', valor: String(calientes.length), detalle: 'Probabilidad ≥ 60%', icono: 'flame', tono: 'positivo' },
        { etiqueta: 'Valor en juego hoy', valor: formatoMoneda(calientes.reduce((a, o) => a + o.monto, 0)), detalle: 'Suma de ofertas calientes', icono: 'target', tono: 'neutro' },
        { etiqueta: 'Clientes fríos', valor: String(frios.length), detalle: 'Más de 60 días sin contacto', icono: 'alert', tono: frios.length ? 'alerta' : 'positivo' },
      ],
    },
  ]

  if (pendientes.length) {
    bloques.push({
      kind: 'checklist',
      titulo: 'Tu lista de hoy',
      subtitulo: 'Ordenada por urgencia. Marca conforme avances.',
      items: pendientes.slice(0, 8).map((t) => {
        const d = diasHasta(t.vence)
        return {
          id: t.id,
          texto: t.titulo,
          detalle: `${t.tipo}${t.nota ? ` · ${t.nota}` : ''}`,
          hecho: false,
          meta: d < 0 ? `vencida hace ${-d} d` : d === 0 ? 'vence hoy' : 'vence mañana',
          tono: d < 0 ? ('negativo' as const) : d === 0 ? ('alerta' as const) : ('neutro' as const),
        }
      }),
    })
  }

  if (calientes.length) {
    bloques.push({
      kind: 'records',
      titulo: 'Empuja estas tres primero',
      layout: 'carrusel',
      items: calientes.map((o) => fichaOferta(o)),
    })
  }

  bloques.push({
    kind: 'choices',
    titulo: 'Atajos',
    opciones: [
      { label: 'Agendar algo más', icon: 'plus', variant: 'primary', run: { tool: 'form_nueva_tarea' } },
      { label: 'Ver ofertas estancadas', icon: 'alert', variant: 'secondary', send: 'Muéstrame mis ofertas estancadas' },
      ...(frios[0] ? [{ label: `Reactivar a ${frios[0].nombre.split(' ').slice(0, 3).join(' ')}`, icon: 'phone', variant: 'secondary' as const, send: `Abre la ficha de ${frios[0].nombre}` }] : []),
    ],
  })

  return {
    texto: `Buenos días. Hoy tienes **${pendientes.length} tareas** (${vencidas.length} ya vencidas) y **${calientes.length} ofertas calientes** que suman ${formatoMoneda(calientes.reduce((a, o) => a + o.monto, 0))}. Si sólo te alcanza para tres llamadas, hazlas a las ofertas calientes.`,
    bloques,
  }
}
