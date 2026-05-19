/**
 * Store para gestión del estado del CRM
 * Maneja las entidades, datos y operaciones CRUD
 */

import { create } from 'zustand'
import type { CRMEntity, CRMEntityType, QueryParams } from '@/types'

interface CRMState {
  // Estado
  entities: Record<CRMEntityType, CRMEntity[]>
  selectedEntity: CRMEntity | null
  activeEntityType: CRMEntityType | null
  isLoading: boolean
  error: string | null
  queryParams: QueryParams
  
  // Acciones
  setEntities: (type: CRMEntityType, entities: CRMEntity[]) => void
  addEntity: (type: CRMEntityType, entity: CRMEntity) => void
  updateEntity: (type: CRMEntityType, id: string, updates: Partial<CRMEntity>) => void
  deleteEntity: (type: CRMEntityType, id: string) => void
  selectEntity: (entity: CRMEntity | null) => void
  setActiveEntityType: (type: CRMEntityType | null) => void
  setQueryParams: (params: Partial<QueryParams>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const initialEntities: Record<CRMEntityType, CRMEntity[]> = {
  contact: [],
  company: [],
  deal: [],
  activity: [],
  product: [],
  custom: [],
}

export const useCRMStore = create<CRMState>((set) => ({
  // Estado inicial
  entities: initialEntities,
  selectedEntity: null,
  activeEntityType: null,
  isLoading: false,
  error: null,
  queryParams: {
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },

  // Establecer lista de entidades
  setEntities: (type, entities) => {
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: entities,
      },
    }))
  },

  // Agregar entidad
  addEntity: (type, entity) => {
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: [...state.entities[type], entity],
      },
    }))
  },

  // Actualizar entidad
  updateEntity: (type, id, updates) => {
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: state.entities[type].map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
      },
    }))
  },

  // Eliminar entidad
  deleteEntity: (type, id) => {
    set((state) => ({
      entities: {
        ...state.entities,
        [type]: state.entities[type].filter((e) => e.id !== id),
      },
      selectedEntity:
        state.selectedEntity?.id === id ? null : state.selectedEntity,
    }))
  },

  // Seleccionar entidad
  selectEntity: (entity) => {
    set({ selectedEntity: entity })
  },

  // Establecer tipo de entidad activa
  setActiveEntityType: (type) => {
    set({ activeEntityType: type })
  },

  // Actualizar parámetros de consulta
  setQueryParams: (params) => {
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    }))
  },

  // Estado de carga
  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  // Establecer error
  setError: (error) => {
    set({ error })
  },
}))


