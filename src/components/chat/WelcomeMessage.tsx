/**
 * Mensaje de bienvenida cuando no hay conversación
 * Diseño premium con glassmorphism y animaciones
 */

import { Sparkles, TrendingUp, Briefcase, CreditCard, GitBranch } from 'lucide-react'
import { obtenerSugerencias } from '@/services/aiAssistantService'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'

// Iconos para las sugerencias
const suggestionIcons = [TrendingUp, Briefcase, CreditCard, GitBranch]

interface WelcomeMessageProps {
  onSend?: (message: string) => void
}

export function WelcomeMessage({ onSend }: WelcomeMessageProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const suggestions = obtenerSugerencias()

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      {/* Icono principal con animación de brillo */}
      <div className="relative mb-8">
        <div 
          className={cn(
            "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl",
            "transform transition-all duration-500 hover:scale-105",
            isHey 
              ? "bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-cyan-500/30" 
              : "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-orange-500/30"
          )}
        >
          <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
        {/* Anillo de brillo animado */}
        <div 
          className={cn(
            "absolute inset-0 rounded-3xl animate-pulse opacity-40",
            isHey ? "bg-cyan-400" : "bg-orange-400"
          )}
          style={{ filter: 'blur(20px)', zIndex: -1 }}
        />
      </div>

      {/* Título con gradiente */}
      <h2 
        className={cn(
          "text-3xl font-bold mb-3 bg-clip-text text-transparent",
          isHey 
            ? "bg-gradient-to-r from-cyan-300 via-white to-purple-300" 
            : "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700"
        )}
      >
        ¡Hola! Soy tu Asistente IA
      </h2>
      
      <p className="text-theme-secondary max-w-lg mb-10 text-base leading-relaxed">
        Estoy aquí para ayudarte a gestionar tu información. Puedo mostrarte datos, 
        generar gráficos, y responder tus preguntas.
      </p>

      {/* Sugerencias con diseño de tarjetas premium */}
      <div className="w-full max-w-2xl">
        <p className="text-sm text-theme-muted mb-4 font-medium uppercase tracking-wider">
          Sugerencias para comenzar
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestionIcons[index] || Sparkles
            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  console.log('Click en sugerencia:', suggestion.query)
                  if (onSend) {
                    onSend(suggestion.query)
                  } else {
                    console.error('onSend no está definido en WelcomeMessage')
                  }
                }}
                className={cn(
                  "group flex items-center gap-4 px-5 py-4 rounded-2xl text-left",
                  "border transition-all duration-300",
                  "hover:scale-[1.02] hover:-translate-y-0.5",
                  isHey
                    ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10"
                    : "bg-orange-50 border-orange-100 hover:bg-orange-100 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10"
                )}
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    isHey 
                      ? "bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30" 
                      : "bg-orange-100 text-orange-500 group-hover:bg-orange-200"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span 
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isHey 
                      ? "text-white/80 group-hover:text-white" 
                      : "text-gray-700 group-hover:text-gray-900"
                  )}
                >
                  {suggestion.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}


