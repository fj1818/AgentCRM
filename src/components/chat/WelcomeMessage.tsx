/**
 * Mensaje de bienvenida cuando no hay conversación
 */

import { Sparkles, Table2, BarChart3, RefreshCw, Search } from 'lucide-react'

const suggestions = [
  {
    icon: Table2,
    text: 'Muéstrame todos los contactos activos',
  },
  {
    icon: BarChart3,
    text: 'Genera un gráfico de ventas por mes',
  },
  {
    icon: RefreshCw,
    text: 'Actualiza el estado del deal #123',
  },
  {
    icon: Search,
    text: '¿Cuántas oportunidades tenemos abiertas?',
  },
]

export function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
      {/* Icono principal */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      {/* Título */}
      <h2 className="text-2xl font-bold text-white mb-2">
        ¡Bienvenido a AgentCRM!
      </h2>
      <p className="text-surface-400 max-w-md mb-8">
        Soy tu asistente inteligente para gestionar el CRM. Puedo mostrarte
        datos, generar gráficos, actualizar registros y responder tus preguntas.
      </p>

      {/* Sugerencias */}
      <div className="w-full max-w-lg">
        <p className="text-sm text-surface-500 mb-3">Prueba preguntando:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-left text-surface-200 hover:bg-surface-700 hover:border-surface-600 transition-all group"
            >
              <suggestion.icon className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <span className="text-sm">{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

