/**
 * Motor del agente.
 *
 * Interpreta lenguaje natural en español, arma un plan visible de pasos y
 * ejecuta herramientas. Todo corre en el navegador con datos locales: la demo
 * no depende de ninguna API, pero la forma del contrato (herramienta + args +
 * bloques de UI) es la misma que usaría un modelo con function calling.
 */

import type { EventoAgente, PasoPlan, RespuestaHerramienta } from './types'
import * as portafolio from './tools'
import * as consulta from './toolsClientes'
import * as acciones from './toolsAcciones'
import { buscarClientes, ETAPAS, productos } from './data'

// ── Registro de herramientas ─────────────────────────────────────────────────

type Herramienta = (args: Record<string, unknown>) => RespuestaHerramienta

export const HERRAMIENTAS: Record<string, { fn: Herramienta; etiqueta: string }> = {
  resumen_portafolio: { fn: () => portafolio.resumenPortafolio(), etiqueta: 'Consultando el embudo completo' },
  ofertas_estancadas: { fn: () => portafolio.ofertasEstancadas(), etiqueta: 'Buscando ofertas sin movimiento' },
  ofertas_que_cierran: { fn: (a) => portafolio.ofertasQueCierran(a as { dias?: number }), etiqueta: 'Revisando fechas de cierre' },
  ofertas_por_etapa: { fn: (a) => portafolio.ofertasPorEtapa(a as { etapa: string }), etiqueta: 'Filtrando por etapa' },

  buscar: { fn: (a) => consulta.buscar(a as { termino: string }), etiqueta: 'Buscando en la base de clientes' },
  abrir_cliente: { fn: (a) => consulta.abrirCliente(a as { clienteId: string }), etiqueta: 'Cargando ficha del cliente' },
  abrir_oferta: { fn: (a) => consulta.abrirOferta(a as { ofertaId: string }), etiqueta: 'Cargando la oferta' },
  clientes_en_riesgo: { fn: () => consulta.clientesEnRiesgo(), etiqueta: 'Evaluando riesgo de fuga' },
  recomendar_producto: { fn: (a) => consulta.recomendarProducto(a as { clienteId?: string; nombre?: string }), etiqueta: 'Cruzando perfil contra catálogo' },
  ver_producto: { fn: (a) => consulta.verProducto(a as { nombre: string }), etiqueta: 'Abriendo ficha de producto' },
  ver_playbook: { fn: (a) => consulta.verPlaybook(a as { categoria?: string }), etiqueta: 'Cargando material de venta' },
  ver_historial: { fn: (a) => consulta.verHistorial(a as { clienteId?: string; nombre?: string }), etiqueta: 'Reconstruyendo la línea de tiempo' },
  analizar_cierres: { fn: () => consulta.analizarCierres(), etiqueta: 'Calculando efectividad por producto' },

  plan_del_dia: { fn: () => acciones.planDelDia(), etiqueta: 'Priorizando tu día' },
  form_nueva_oferta: { fn: (a) => acciones.formNuevaOferta(a), etiqueta: 'Preparando el alta de oferta' },
  form_editar_oferta: { fn: (a) => acciones.formEditarOferta(a as { ofertaId: string }), etiqueta: 'Cargando datos actuales' },
  form_nueva_tarea: { fn: (a) => acciones.formNuevaTarea(a), etiqueta: 'Preparando la agenda' },
  form_registrar_actividad: { fn: (a) => acciones.formRegistrarActividad(a), etiqueta: 'Preparando el registro' },

  confirmar_avance: { fn: (a) => acciones.confirmarAvance(a as { ofertaId: string }), etiqueta: 'Calculando el impacto del cambio' },
  confirmar_perdida: { fn: (a) => acciones.confirmarPerdida(a as { ofertaId: string }), etiqueta: 'Calculando el impacto del cambio' },
  confirmar_seguimiento_masivo: { fn: (a) => acciones.confirmarSeguimientoMasivo(a as { ids: string[] }), etiqueta: 'Armando el lote de tareas' },

  crear_oferta: { fn: (a) => acciones.crearOferta(a), etiqueta: 'Escribiendo en el CRM' },
  guardar_oferta: { fn: (a) => acciones.guardarOferta(a), etiqueta: 'Guardando cambios' },
  aplicar_avance: { fn: (a) => acciones.aplicarAvance(a), etiqueta: 'Actualizando la etapa' },
  aplicar_perdida: { fn: (a) => acciones.aplicarPerdida(a), etiqueta: 'Actualizando la oferta' },
  crear_tarea: { fn: (a) => acciones.crearTarea(a), etiqueta: 'Agendando' },
  crear_actividad: { fn: (a) => acciones.crearActividad(a), etiqueta: 'Guardando en el historial' },
  aplicar_seguimiento_masivo: { fn: (a) => acciones.aplicarSeguimientoMasivo(a), etiqueta: 'Creando las tareas' },
  completar_tarea: { fn: (a) => acciones.completarTarea(a), etiqueta: 'Marcando como hecha' },
}

// ── Interpretación de intención ──────────────────────────────────────────────

interface Intencion {
  tool: string
  args: Record<string, unknown>
  /** Pasos que el usuario ve mientras el agente trabaja. */
  pasos: string[]
}

const sinAcentos = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const tiene = (t: string, ...palabras: string[]) => palabras.some((p) => t.includes(p))

/** Extrae el nombre del cliente después de una preposición típica. */
function nombreMencionado(texto: string): string | null {
  const m = texto.match(/\b(?:de|a|para|con|sobre|cliente)\s+(.{3,60})$/i)
  const candidato = (m?.[1] ?? texto).replace(/[?¿.!¡]/g, '').trim()
  if (candidato.length < 3) return null
  return buscarClientes(candidato).length ? candidato : null
}

export function interpretar(entrada: string): Intencion {
  const t = sinAcentos(entrada.trim())

  // ID explícito de oferta
  const idOferta = entrada.match(/\bOF-\d{3,5}\b/i)?.[0]
  if (idOferta) {
    if (tiene(t, 'avanza', 'mueve', 'siguiente etapa'))
      return { tool: 'confirmar_avance', args: { ofertaId: idOferta }, pasos: ['Localizando la oferta', 'Calculando el impacto del cambio'] }
    if (tiene(t, 'perdida', 'perdi', 'descarta'))
      return { tool: 'confirmar_perdida', args: { ofertaId: idOferta }, pasos: ['Localizando la oferta', 'Preparando confirmación'] }
    if (tiene(t, 'edita', 'modifica', 'cambia'))
      return { tool: 'form_editar_oferta', args: { ofertaId: idOferta }, pasos: ['Cargando datos actuales'] }
    return { tool: 'abrir_oferta', args: { ofertaId: idOferta }, pasos: ['Localizando la oferta', 'Cargando actividad relacionada'] }
  }

  // Plan del día / agenda
  if (tiene(t, 'plan del dia', 'mi dia', 'que hago hoy', 'agenda de hoy', 'prioridades', 'por donde empiezo', 'buenos dias', 'mis tareas', 'tareas pendientes'))
    return { tool: 'plan_del_dia', args: {}, pasos: ['Leyendo tareas pendientes', 'Puntuando ofertas por valor esperado', 'Detectando clientes fríos', 'Ordenando por impacto'] }

  // Portafolio / embudo
  if (tiene(t, 'portafolio', 'embudo', 'pipeline', 'como voy', 'como va mi', 'resumen', 'tablero', 'dashboard'))
    return { tool: 'resumen_portafolio', args: {}, pasos: ['Consultando ofertas del ejecutivo', 'Calculando pronóstico ponderado', 'Agrupando por etapa y familia'] }

  // Estancadas
  if (tiene(t, 'estancad', 'sin movimiento', 'frias', 'atoradas', 'olvidadas', 'no se mueven'))
    return { tool: 'ofertas_estancadas', args: {}, pasos: ['Midiendo días sin movimiento', 'Filtrando por umbral de 30 días', 'Ordenando por monto en riesgo'] }

  // Cierres próximos
  if (tiene(t, 'cierran', 'cierre esta semana', 'vencen', 'por vencer', 'esta semana', 'este mes')) {
    const dias = tiene(t, 'mes') ? 30 : tiene(t, 'hoy') ? 1 : 7
    return { tool: 'ofertas_que_cierran', args: { dias }, pasos: ['Filtrando por fecha comprometida', 'Separando vencidas de vigentes'] }
  }

  // Etapa concreta
  const etapa = ETAPAS.find((e) => t.includes(sinAcentos(e)))
  if (etapa && tiene(t, 'etapa', 'ofertas en', 'muestrame'))
    return { tool: 'ofertas_por_etapa', args: { etapa }, pasos: [`Filtrando ofertas en ${etapa}`] }

  // Riesgo de fuga
  if (tiene(t, 'riesgo', 'fuga', 'se me van', 'perder clientes', 'churn', 'insatisfech'))
    return { tool: 'clientes_en_riesgo', args: {}, pasos: ['Leyendo salud de relación', 'Cruzando NPS y días sin contacto', 'Ordenando por fragilidad'] }

  // Recomendación
  if (tiene(t, 'que le vendo', 'que producto', 'recomienda', 'recomiendo', 'cross sell', 'cross-sell', 'siguiente venta', 'ofrecerle')) {
    const nombre = nombreMencionado(entrada)
    if (nombre) return { tool: 'recomendar_producto', args: { nombre }, pasos: ['Leyendo perfil del cliente', 'Descartando productos ya contratados', 'Puntuando afinidad por giro y facturación', 'Armando comparativo'] }
  }

  // Historial
  if (tiene(t, 'historial', 'linea de tiempo', 'que ha pasado', 'actividad de', 'interacciones')) {
    const nombre = nombreMencionado(entrada)
    return { tool: 'ver_historial', args: { nombre: nombre ?? entrada }, pasos: ['Buscando el cliente', 'Reconstruyendo interacciones'] }
  }

  // Registrar interacción. Se excluye si habla de una oferta: eso es un alta.
  if (!t.includes('oferta') && tiene(t, 'registra', 'anota', 'apunta', 'acabo de llamar', 'hable con', 'me reuni'))
    return { tool: 'form_registrar_actividad', args: { clienteId: buscarClientes(entrada)[0]?.id }, pasos: ['Preparando el registro'] }

  // Crear oferta: cualquier verbo de alta combinado con la palabra "oferta".
  if (t.includes('oferta') && tiene(t, 'crear', 'crea ', 'nueva', 'nuevo', 'alta', 'levantar', 'registrar', 'agregar')) {
    const nombre = nombreMencionado(entrada)
    const cli = nombre ? buscarClientes(nombre)[0] : undefined
    return { tool: 'form_nueva_oferta', args: { clienteId: cli?.id }, pasos: ['Leyendo catálogo de productos', 'Precargando valores sugeridos'] }
  }

  // Agendar tarea
  if (tiene(t, 'agenda', 'agendar', 'recuerdame', 'tarea', 'recordatorio', 'llamar a', 'visitar')) {
    const nombre = nombreMencionado(entrada)
    const cli = nombre ? buscarClientes(nombre)[0] : buscarClientes(entrada)[0]
    return { tool: 'form_nueva_tarea', args: { clienteId: cli?.id }, pasos: ['Preparando la agenda'] }
  }

  // Playbook
  if (tiene(t, 'playbook', 'objecion', 'objeciones', 'como respondo', 'argumento', 'tarjetas', 'entrenamiento', 'capacitacion')) {
    const cat = tiene(t, 'objecion') ? 'objeción' : tiene(t, 'cierre') ? 'cierre' : tiene(t, 'descubrimiento') ? 'descubrimiento' : tiene(t, 'cumplimiento') ? 'cumplimiento' : undefined
    return { tool: 'ver_playbook', args: { categoria: cat }, pasos: ['Buscando en el material de venta'] }
  }

  // Abrir ficha de cliente por nombre.
  if (tiene(t, 'abre', 'abrir', 'ficha', 'ver cliente', 'muestrame el cliente', 'dame el cliente')) {
    const nombre = nombreMencionado(entrada)
    if (nombre) return { tool: 'buscar', args: { termino: nombre }, pasos: ['Localizando al cliente', 'Cargando ficha completa'] }
  }

  // Analítica de cierres. Va antes que la ficha de producto porque preguntas
  // como "cómo van mis cierres por producto" contienen la palabra "producto".
  if (tiene(t, 'cierres', 'efectividad', 'conversion', 'vendo mejor', 'rentab', 'analiza'))
    return { tool: 'analizar_cierres', args: {}, pasos: ['Agrupando ofertas cerradas', 'Calculando tasa por familia', 'Detectando la fuga principal'] }

  // Producto
  const prod = productos.find((p) => t.includes(sinAcentos(p.nombre)))
  if (prod || tiene(t, 'producto', 'requisitos', 'tasa de', 'condiciones de'))
    return { tool: 'ver_producto', args: { nombre: prod?.nombre ?? entrada }, pasos: ['Abriendo ficha de producto', 'Cargando requisitos'] }

  // Búsqueda por defecto
  return { tool: 'buscar', args: { termino: entrada }, pasos: ['Buscando coincidencias en el CRM'] }
}

// ── Ejecución con eventos ────────────────────────────────────────────────────

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Ejecuta una herramienta por nombre, sin pasar por interpretación. */
export async function* ejecutarHerramienta(
  tool: string,
  args: Record<string, unknown> = {}
): AsyncGenerator<EventoAgente> {
  const entrada = HERRAMIENTAS[tool]
  if (!entrada) {
    yield { tipo: 'respuesta', texto: `No tengo una herramienta llamada \`${tool}\`.` }
    return
  }

  const paso: PasoPlan = { id: 'p0', label: entrada.etiqueta, herramienta: tool, estado: 'corriendo' }
  yield { tipo: 'plan', pasos: [paso] }
  await espera(240)

  try {
    const res = entrada.fn(args)
    yield { tipo: 'paso', id: 'p0', estado: 'listo' }
    await espera(80)
    yield { tipo: 'respuesta', texto: res.texto, bloques: res.bloques }
    if (res.registro) yield { tipo: 'registro', ...res.registro }
    if (res.contexto !== undefined) yield { tipo: 'contexto', valor: res.contexto }
  } catch (e) {
    yield { tipo: 'respuesta', texto: `Algo falló al ejecutar la acción: ${e instanceof Error ? e.message : 'error desconocido'}.` }
  }
}

/** Resuelve un mensaje en lenguaje natural. */
export async function* correrAgente(entrada: string): AsyncGenerator<EventoAgente> {
  const intencion = interpretar(entrada)

  const pasos: PasoPlan[] = intencion.pasos.map((label, i) => ({
    id: `p${i}`,
    label,
    herramienta: i === intencion.pasos.length - 1 ? intencion.tool : undefined,
    estado: 'pendiente',
  }))

  yield { tipo: 'plan', pasos }

  for (const p of pasos) {
    yield { tipo: 'paso', id: p.id, estado: 'corriendo' }
    await espera(180 + Math.random() * 160)
    yield { tipo: 'paso', id: p.id, estado: 'listo' }
  }

  try {
    const res = HERRAMIENTAS[intencion.tool]!.fn(intencion.args)
    await espera(120)
    yield { tipo: 'respuesta', texto: res.texto, bloques: res.bloques }
    if (res.registro) yield { tipo: 'registro', ...res.registro }
    if (res.contexto !== undefined) yield { tipo: 'contexto', valor: res.contexto }
  } catch (e) {
    yield { tipo: 'respuesta', texto: `No pude completar la consulta: ${e instanceof Error ? e.message : 'error desconocido'}.` }
  }
}
