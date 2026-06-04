/**
 * Store para gestión del estado de la UI
 * Maneja temas, modales, sidebars, etc.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'banregio' | 'hey'
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
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarState: (state: SidebarState) => void
  setMobileMenuOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  initTheme: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  if (theme === 'hey') {
    root.classList.add('dark')
    root.classList.remove('light')
    root.setAttribute('data-theme', 'hey')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'banregio')
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      theme: 'banregio',
      sidebarState: 'expanded',
      isMobileMenuOpen: false,
      activeModal: null,
      notifications: [],

      // Inicializar tema al cargar
      initTheme: () => {
        const theme = get().theme
        applyTheme(theme)
      },

      // Cambiar tema
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      // Toggle entre Banregio y Hey
      toggleTheme: () => {
        const newTheme = get().theme === 'banregio' ? 'hey' : 'banregio'
        set({ theme: newTheme })
        applyTheme(newTheme)
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
      // No persistimos sidebarState: la barra siempre inicia desplegada.
      partialize: (state) => ({
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // Aplicar tema cuando se rehidrate el estado
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)


