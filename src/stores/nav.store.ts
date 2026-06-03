/**
 * Store de navegación entre módulos. Permite saltar de una vista a otra
 * (ej. desde Ciclo de vida abrir una oferta en el módulo Ofertas).
 */

import { create } from 'zustand'

interface NavState {
  view: string
  /** ID de oferta a abrir al entrar al módulo Ofertas */
  ofertaPendiente: string | null
  setView: (view: string) => void
  abrirOferta: (idOferta: string) => void
  limpiarOfertaPendiente: () => void
}

export const useNavStore = create<NavState>((set) => ({
  view: 'chat',
  ofertaPendiente: null,
  setView: (view) => set({ view }),
  abrirOferta: (idOferta) => set({ view: 'ofertas', ofertaPendiente: idOferta }),
  limpiarOfertaPendiente: () => set({ ofertaPendiente: null }),
}))
