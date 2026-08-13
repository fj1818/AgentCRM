/**
 * Estado de la conversación agéntica.
 *
 * Consume los eventos del motor y va mutando el turno en curso, de modo que el
 * usuario ve el plan aparecer paso a paso antes de recibir los bloques.
 */

import { create } from 'zustand'
import type { AccionRegistrada, Block, PasoPlan, Turno } from '@/agentic/types'
import { correrAgente, ejecutarHerramienta } from '@/agentic/engine'
import { clientePorId, ofertaPorId } from '@/agentic/data'

type Contexto = { tipo: 'cliente' | 'oferta'; id: string } | null

interface AgenteState {
  turnos: Turno[]
  trabajando: boolean
  contexto: Contexto
  bitacora: AccionRegistrada[]
  /** IDs de bloques de acción ya resueltos, para deshabilitarlos tras usarlos. */
  consumidos: Record<string, string>

  enviar: (texto: string) => Promise<void>
  ejecutar: (tool: string, args?: Record<string, unknown>, etiqueta?: string) => Promise<void>
  marcarConsumido: (clave: string, resultado: string) => void
  limpiar: () => void
  fijarContexto: (c: Contexto) => void
}

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const useAgenteStore = create<AgenteState>((set, get) => ({
  turnos: [],
  trabajando: false,
  contexto: null,
  bitacora: [],
  consumidos: {},

  fijarContexto: (c) => set({ contexto: c }),

  marcarConsumido: (clave, resultado) =>
    set((s) => ({ consumidos: { ...s.consumidos, [clave]: resultado } })),

  limpiar: () => set({ turnos: [], contexto: null, bitacora: [], consumidos: {} }),

  enviar: async (texto) => {
    const limpio = texto.trim()
    if (!limpio || get().trabajando) return

    const turnoUsuario: Turno = { id: uid(), rol: 'usuario', texto: limpio, estado: 'listo', ts: Date.now() }
    const turnoAgente: Turno = { id: uid(), rol: 'agente', estado: 'pensando', plan: [], bloques: [], ts: Date.now() }

    set((s) => ({ turnos: [...s.turnos, turnoUsuario, turnoAgente], trabajando: true }))
    await consumir(correrAgente(limpio), turnoAgente.id, set)
    set({ trabajando: false })
  },

  ejecutar: async (tool, args = {}, etiqueta) => {
    if (get().trabajando) return

    const turnos: Turno[] = []
    // Las acciones lanzadas desde un botón se muestran como intención del usuario
    // para que la conversación siga leyéndose de corrido.
    if (etiqueta) turnos.push({ id: uid(), rol: 'usuario', texto: etiqueta, estado: 'listo', ts: Date.now() })
    const turnoAgente: Turno = { id: uid(), rol: 'agente', estado: 'pensando', plan: [], bloques: [], ts: Date.now() }
    turnos.push(turnoAgente)

    set((s) => ({ turnos: [...s.turnos, ...turnos], trabajando: true }))
    await consumir(ejecutarHerramienta(tool, args), turnoAgente.id, set)
    set({ trabajando: false })
  },
}))

/** Aplica los eventos del motor sobre el turno del agente. */
async function consumir(
  gen: AsyncGenerator<import('@/agentic/types').EventoAgente>,
  turnoId: string,
  set: (fn: (s: AgenteState) => Partial<AgenteState>) => void
) {
  const parche = (cambio: (t: Turno) => Turno) =>
    set((s) => ({ turnos: s.turnos.map((t) => (t.id === turnoId ? cambio(t) : t)) }))

  for await (const ev of gen) {
    switch (ev.tipo) {
      case 'plan':
        parche((t) => ({ ...t, plan: ev.pasos }))
        break
      case 'paso':
        parche((t) => ({
          ...t,
          plan: (t.plan ?? []).map((p: PasoPlan) => (p.id === ev.id ? { ...p, estado: ev.estado, detalle: ev.detalle ?? p.detalle } : p)),
        }))
        break
      case 'respuesta':
        parche((t) => ({ ...t, texto: ev.texto, bloques: (ev.bloques ?? []) as Block[], estado: 'listo' }))
        break
      case 'registro':
        set((s) => ({
          bitacora: [{ id: uid(), titulo: ev.titulo, detalle: ev.detalle, ts: Date.now() }, ...s.bitacora].slice(0, 20),
        }))
        break
      case 'contexto':
        set(() => ({ contexto: ev.valor }))
        break
    }
  }

  parche((t) => (t.estado === 'pensando' ? { ...t, estado: 'listo' } : t))
}

/** Nombre legible de la entidad fijada como contexto. */
export function nombreContexto(c: Contexto): string | null {
  if (!c) return null
  if (c.tipo === 'cliente') return clientePorId(c.id)?.nombre ?? null
  const o = ofertaPorId(c.id)
  return o ? `${o.id} · ${o.producto}` : null
}
