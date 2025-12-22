/**
 * Componente principal de la aplicación
 */

import { AppLayout } from '@/components/layout'
import { ChatContainer } from '@/components/chat'

function App() {
  return (
    <AppLayout>
      <ChatContainer />
    </AppLayout>
  )
}

export default App

