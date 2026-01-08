/**
 * Componente principal de la aplicación
 */

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { ChatContainer } from '@/components/chat'
import { ClientesTable } from '@/components/clientes'
import { CotizadorContainer } from '@/components/cotizador'
import { TareasContainer } from '@/components/tareas'

function App() {
  const [currentView, setCurrentView] = useState('chat')

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'chat' && <ChatContainer />}
      {currentView === 'clientes' && <ClientesTable />}
      {currentView === 'cotizador' && <CotizadorContainer />}
      {currentView === 'tareas' && <TareasContainer />}
    </AppLayout>
  )
}

export default App


