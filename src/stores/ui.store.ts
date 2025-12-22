/**
 * Store para gestión del estado de la UI
 * Maneja temas, modales, sidebars, etc.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type SidebarState = 'expanded' | 'collapsed' | 'hidden'

interface UIState {
  // Estado
  theme: Theme
  sidebarState: SidebarState
  isMobileMenuOpen: boolean
  activeModal: string | null
  notifications: Notification[]
  
  // Acciones
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarState: (state: SidebarState) => void
  setMobileMenuOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Estado inicial
      theme: 'dark',
      sidebarState: 'expanded',
      isMobileMenuOpen: false,
      activeModal: null,
      notifications: [],

      // Cambiar tema
      setTheme: (theme) => {
        set({ theme })
        // Aplicar clase al documento
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      // Toggle sidebar
      toggleSidebar: () => {
        set((state) => ({
          sidebarState:
            state.sidebarState === 'expanded' ? 'collapsed' : 'expanded',
        }))
      },

      // Establecer estado del sidebar
      setSidebarState: (sidebarState) => {
        set({ sidebarState })
      },

      // Menú móvil
      setMobileMenuOpen: (open) => {
        set({ isMobileMenuOpen: open })
      },

      // Abrir modal
      openModal: (modalId) => {
        set({ activeModal: modalId })
      },

      // Cerrar modal
      closeModal: () => {
        set({ activeModal: null })
      },

      // Agregar notificación
      addNotification: (notification) => {
        const id = `notif_${Date.now()}`
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }],
        }))

        // Auto-remover después de la duración
        if (notification.duration !== 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }))
          }, notification.duration || 5000)
        }
      },

      // Remover notificación
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },
    }),
    {
      name: 'agent-crm-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarState: state.sidebarState,
      }),
    }
  )
)

