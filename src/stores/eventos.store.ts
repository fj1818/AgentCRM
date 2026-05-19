/**
 * Store para gestión de eventos agendados
 * Compartido entre Chat, AgendaCalendar y CronogramaDiario
 */

import { create } from 'zustand'

export interface EventoAgendado {
  id: string
  tipo: 'reunion' | 'tarea'
  nombre: string
  fecha: string // formato YYYY-MM-DD
  hora?: string // formato HH:MM
  duracion: number // minutos
  descripcion?: string
  cliente?: string
  completado?: boolean
  esPlaneada?: boolean
  createdAt: Date
}

interface EventosState {
  eventos: EventoAgendado[]
  
  // Acciones
  agregarEvento: (evento: Omit<EventoAgendado, 'id' | 'createdAt'>) => EventoAgendado
  eliminarEvento: (id: string) => void
  marcarCompletado: (id: string, completado: boolean) => void
  
  // Getters
  getEventosPorFecha: (fecha: string) => EventoAgendado[]
  getReuniones: () => EventoAgendado[]
  getTareas: () => EventoAgendado[]
}

export const useEventosStore = create<EventosState>((set, get) => ({
  eventos: [],
  
  agregarEvento: (evento) => {
    const nuevoEvento: EventoAgendado = {
      ...evento,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      duracion: typeof evento.duracion === 'string' ? parseInt(evento.duracion) : evento.duracion,
      esPlaneada: evento.esPlaneada ?? true, // Por defecto es planeada si no se especifica
      createdAt: new Date()
    }
    
    set((state) => ({
      eventos: [...state.eventos, nuevoEvento]
    }))
    
    console.log('✨ Evento agregado al store:', nuevoEvento)
    return nuevoEvento
  },
  
  eliminarEvento: (id) => {
    set((state) => ({
      eventos: state.eventos.filter(e => e.id !== id)
    }))
  },
  
  marcarCompletado: (id, completado) => {
    set((state) => ({
      eventos: state.eventos.map(e => 
        e.id === id ? { ...e, completado } : e
      )
    }))
  },
  
  getEventosPorFecha: (fecha) => {
    return get().eventos.filter(e => e.fecha === fecha)
  },
  
  getReuniones: () => {
    return get().eventos.filter(e => e.tipo === 'reunion')
  },
  
  getTareas: () => {
    return get().eventos.filter(e => e.tipo === 'tarea')
  }
}))
