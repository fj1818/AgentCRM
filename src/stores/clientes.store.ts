/**
 * Store para gestión de clientes
 */

import { create } from 'zustand'
import type { Cliente, TipoPersona } from '@/types'
import { clientesData } from '@/data/clientesData'

interface ClientesFiltros {
  busqueda: string
  tipoPersona: TipoPersona | 'todos'
  soloActivos: boolean
}

interface ClientesState {
  clientes: Cliente[]
  isLoading: boolean
  error: string | null
  selectedCliente: Cliente | null
  filtros: ClientesFiltros
  
  // Acciones
  setClientes: (clientes: Cliente[]) => void
  setSelectedCliente: (cliente: Cliente | null) => void
  setFiltros: (filtros: Partial<ClientesFiltros>) => void
  resetFiltros: () => void
  getClientesFiltrados: () => Cliente[]
}

const filtrosIniciales: ClientesFiltros = {
  busqueda: '',
  tipoPersona: 'todos',
  soloActivos: false,
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: clientesData,
  isLoading: false,
  error: null,
  selectedCliente: null,
  filtros: filtrosIniciales,

  setClientes: (clientes) => set({ clientes }),
  
  setSelectedCliente: (cliente) => set({ selectedCliente: cliente }),
  
  setFiltros: (nuevosFiltros) => set((state) => ({
    filtros: { ...state.filtros, ...nuevosFiltros }
  })),
  
  resetFiltros: () => set({ filtros: filtrosIniciales }),
  
  getClientesFiltrados: () => {
    const { clientes, filtros } = get()
    
    return clientes.filter((cliente) => {
      // Filtro por búsqueda
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        const coincide = 
          cliente.nombreRazonSocial.toLowerCase().includes(busqueda) ||
          cliente.rfc.toLowerCase().includes(busqueda) ||
          cliente.ide.toString().includes(busqueda) ||
          cliente.idCliente.toLowerCase().includes(busqueda)
        
        if (!coincide) return false
      }
      
      // Filtro por tipo de persona
      if (filtros.tipoPersona !== 'todos' && cliente.tipoPersona !== filtros.tipoPersona) {
        return false
      }
      
      // Filtro solo activos (sin fecha de baja)
      if (filtros.soloActivos && cliente.fechaBaja) {
        return false
      }
      
      return true
    })
  },
}))
