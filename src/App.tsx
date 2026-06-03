/**
 * Componente principal de la aplicación
 */

import { AppLayout } from '@/components/layout'
import { ChatContainer } from '@/components/chat'
import { OfertasContainer } from '@/components/ofertas'
import { CicloVidaContainer } from '@/components/ciclo'
import { CotizadorContainer } from '@/components/cotizador'
import { TareasContainer } from '@/components/tareas'
import { useNavStore } from '@/stores/nav.store'

function App() {
  const currentView = useNavStore((s) => s.view)
  const setView = useNavStore((s) => s.setView)

  return (
    <AppLayout currentView={currentView} onNavigate={setView}>
      {currentView === 'chat' && <ChatContainer />}
      {currentView === 'ofertas' && <OfertasContainer />}
      {currentView === 'ciclo' && <CicloVidaContainer />}
      {currentView === 'cotizador' && <CotizadorContainer />}
      {currentView === 'tareas' && <TareasContainer />}
    </AppLayout>
  )
}

export default App
