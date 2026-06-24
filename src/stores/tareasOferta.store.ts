/**
 * Store del Módulo de Tareas (vinculadas a Ofertas) — alcance Hey Tech.
 * Cada tarea está ligada a una Oferta existente. Reglas (mem_alcance-heytech):
 *  - Comentario de cierre obligatorio al pasar a Completada o Cancelada.
 *  - Al cerrar, el comentario se replica como nota en la oferta vinculada.
 *  - Una tarea cerrada (Completada/Cancelada) no puede editarse.
 */

import { create } from 'zustand'
import { useOfertasStore } from './ofertas.store'
import { HEYTECH_OFFER_ID } from '@/data/ofertas-seed/heytech'

export type TareaEstatus = 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada'
export type TareaPrioridad = 'Alta' | 'Media' | 'Baja' | ''

export interface Tarea {
  id: string
  titulo: string
  tipo: string
  idOferta: string
  rfc: string
  responsable: string
  asignadoPor: string
  fechaVencimiento: string // dd/mm/yyyy
  descripcion: string
  prioridad: TareaPrioridad
  estatus: TareaEstatus
  comentarioCierre: string
  fechaCreacion: string
  fechaCierre: string
}

/** Usuario activo de la demo (ejecutivo Hey Tech). */
export const USUARIO_ACTUAL = 'Carlos Mendoza'

export const TIPOS_TAREA = [
  'Llamada', 'Correo', 'Reunión', 'Demo Técnica', 'Envío de Propuesta', 'Seguimiento', 'Otro',
]
export const PRIORIDADES: TareaPrioridad[] = ['Alta', 'Media', 'Baja']
export const ESTATUS_TAREA: TareaEstatus[] = ['Pendiente', 'En Progreso', 'Completada', 'Cancelada']
export const ESTATUS_CERRADOS: TareaEstatus[] = ['Completada', 'Cancelada']

function todayDmy(): string {
  const d = new Date(); const p = (n: number) => (n < 10 ? '0' + n : '' + n)
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}
function pad(n: number, w: number): string { let s = String(n); while (s.length < w) s = '0' + s; return s }

const seedTareas: Tarea[] = [
  {
    id: 'TSK000001', titulo: 'Enviar propuesta actualizada con ajuste de precio',
    tipo: 'Envío de Propuesta', idOferta: HEYTECH_OFFER_ID, rfc: 'FINTECHLATAM01',
    responsable: USUARIO_ACTUAL, asignadoPor: USUARIO_ACTUAL, fechaVencimiento: '25/06/2026',
    descripcion: 'Incorporar el descuento por volumen acordado en la última sesión.',
    prioridad: 'Alta', estatus: 'Pendiente', comentarioCierre: '',
    fechaCreacion: '23/06/2026', fechaCierre: '',
  },
  {
    id: 'TSK000002', titulo: 'Agendar sesión técnica con el equipo de integración',
    tipo: 'Reunión', idOferta: HEYTECH_OFFER_ID, rfc: 'FINTECHLATAM01',
    responsable: USUARIO_ACTUAL, asignadoPor: USUARIO_ACTUAL, fechaVencimiento: '20/06/2026',
    descripcion: 'Validar requerimientos de la integración con WhatsApp Business API.',
    prioridad: 'Media', estatus: 'Completada',
    comentarioCierre: 'Sesión realizada. El cliente confirma uso de la API oficial.',
    fechaCreacion: '15/06/2026', fechaCierre: '19/06/2026',
  },
  {
    id: 'TSK000003', titulo: 'Preparar demo técnica del Asistente Virtual de Texto',
    tipo: 'Demo Técnica', idOferta: HEYTECH_OFFER_ID, rfc: 'FINTECHLATAM01',
    responsable: 'Laura Gómez', asignadoPor: USUARIO_ACTUAL, fechaVencimiento: '27/06/2026',
    descripcion: 'Armar ambiente de demo con datos de prueba del cliente.',
    prioridad: 'Alta', estatus: 'En Progreso', comentarioCierre: '',
    fechaCreacion: '22/06/2026', fechaCierre: '',
  },
  {
    id: 'TSK000004', titulo: 'Revisar borrador de NDA con legal',
    tipo: 'Seguimiento', idOferta: HEYTECH_OFFER_ID, rfc: 'FINTECHLATAM01',
    responsable: 'Diego Torres', asignadoPor: USUARIO_ACTUAL, fechaVencimiento: '24/06/2026',
    descripcion: 'Confirmar cláusulas de confidencialidad para operación en Colombia.',
    prioridad: 'Media', estatus: 'Pendiente', comentarioCierre: '',
    fechaCreacion: '21/06/2026', fechaCierre: '',
  },
]

interface TareasState {
  tareas: Tarea[]
  tareasByOferta: (idOferta: string) => Tarea[]
  /** Tareas donde el usuario activo es el responsable. */
  misTareas: () => Tarea[]
  /** Tareas que el usuario activo asignó a otra persona. */
  tareasAsignadas: () => Tarea[]
  addTarea: (p: { idOferta: string; rfc: string; titulo: string; tipo: string; responsable: string; fechaVencimiento: string; descripcion?: string; prioridad?: TareaPrioridad }) => { ok: boolean; error?: string }
  updateTarea: (id: string, changes: Partial<Tarea>) => { ok: boolean; error?: string }
}

export const useTareasOfertaStore = create<TareasState>((set, get) => ({
  tareas: seedTareas,

  tareasByOferta: (idOferta) => get().tareas.filter((t) => t.idOferta === idOferta),
  misTareas: () => get().tareas.filter((t) => t.responsable === USUARIO_ACTUAL),
  tareasAsignadas: () => get().tareas.filter((t) => t.asignadoPor === USUARIO_ACTUAL && t.responsable !== USUARIO_ACTUAL),

  addTarea: (p) => {
    if (!p.idOferta) return { ok: false, error: 'La tarea debe estar vinculada a una oferta.' }
    if (!p.titulo.trim() || !p.tipo || !p.fechaVencimiento || !p.responsable.trim()) {
      return { ok: false, error: 'Título, Tipo, Fecha de vencimiento y Responsable son obligatorios.' }
    }
    const { tareas } = get()
    const nueva: Tarea = {
      id: 'TSK' + pad(tareas.length + 1, 6),
      titulo: p.titulo.trim(), tipo: p.tipo, idOferta: p.idOferta, rfc: p.rfc,
      responsable: p.responsable.trim(), asignadoPor: USUARIO_ACTUAL, fechaVencimiento: p.fechaVencimiento,
      descripcion: (p.descripcion || '').trim(), prioridad: p.prioridad || '',
      estatus: 'Pendiente', comentarioCierre: '', fechaCreacion: todayDmy(), fechaCierre: '',
    }
    set({ tareas: [...tareas, nueva] })
    return { ok: true }
  },

  updateTarea: (id, changes) => {
    const { tareas } = get()
    const idx = tareas.findIndex((t) => t.id === id)
    if (idx === -1) return { ok: false, error: 'No se encontró la tarea.' }
    const prev = tareas[idx]!

    // Una tarea cerrada no puede editarse (RN módulo de Tareas).
    if (ESTATUS_CERRADOS.includes(prev.estatus)) return { ok: false, error: 'Una tarea cerrada no puede editarse.' }

    const next: Tarea = { ...prev, ...changes }
    const seCierra = changes.estatus !== undefined && ESTATUS_CERRADOS.includes(changes.estatus)

    if (seCierra) {
      const comentario = (changes.comentarioCierre ?? next.comentarioCierre ?? '').trim()
      if (!comentario) return { ok: false, error: 'El comentario de cierre es obligatorio al completar o cancelar.' }
      next.comentarioCierre = comentario
      next.fechaCierre = todayDmy()
      // Replicar el comentario de cierre como nota en la oferta vinculada.
      useOfertasStore.getState().addComment({
        idOferta: next.idOferta, rfc: next.rfc,
        comentario: `[Tarea ${next.estatus}] ${next.titulo}: ${comentario}`,
      })
    }

    const arr = tareas.slice(); arr[idx] = next
    set({ tareas: arr })
    return { ok: true }
  },
}))
