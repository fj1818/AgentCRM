/**
 * Componente principal de la aplicación
 */

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { ChatContainer } from '@/components/chat'
import { OfertasContainer } from '@/components/ofertas'
import { CicloVidaContainer } from '@/components/ciclo'
import { CotizadorContainer } from '@/components/cotizador'
import { TareasContainer } from '@/components/tareas'

function App() {
  const [currentView, setCurrentView] = useState('chat')

  return (
    <AppLayout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'chat' && <ChatContainer />}
      {currentView === 'ofertas' && <OfertasContainer />}
      {currentView === 'ciclo' && <CicloVidaContainer />}
      {currentView === 'cotizador' && <CotizadorContainer />}
      {currentView === 'tareas' && <TareasContainer />}
    </AppLayout>
  )
}

export default App


