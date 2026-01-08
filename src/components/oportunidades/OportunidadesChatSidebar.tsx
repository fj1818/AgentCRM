/**
 * Sidebar de chat para el agente de oportunidades
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

// Webhook URL para el agente de oportunidades (placeholder)
const WEBHOOK_OPORTUNIDADES = 'https://abrahamnavarrete.app.n8n.cloud/webhook/oportunidades'

interface Mensaje {
  id: string
  rol: 'usuario' | 'agente'
  contenido: string
  timestamp: Date
}

export function OportunidadesChatSidebar() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      rol: 'agente',
      contenido: '¡Hola! Soy tu asistente de oportunidades. Puedo ayudarte a:\n\n📊 Analizar cartera de clientes\n🔍 Buscar oportunidades de venta\n💼 Gestionar renovaciones\n📈 Ver rendimiento por promotor\n\n¿Qué necesitas hoy?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  // Session ID persistente para oportunidades
  const [sessionId] = useState(() => `oportunidades_${Date.now()}`)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const enviarAlAgente = async (texto: string) => {
    try {
      setCargando(true)
      
      const response = await fetch(WEBHOOK_OPORTUNIDADES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje: texto,
          sessionId: sessionId,
          fechaActual: new Date().toISOString(),
          contexto: 'oportunidades' 
        })
      })

      if (!response.ok) throw new Error('Error en el servicio')

      const data = await response.json()
      
      // Procesar respuesta del agente (similar a TareasContainer)
      let respuestaTexto = 'Lo siento, no pude procesar tu solicitud.'
      
      if (typeof data.output === 'string') {
        respuestaTexto = data.output
      } else if (typeof data.text === 'string') {
        respuestaTexto = data.text
      } else if (typeof data.message === 'string') {
        respuestaTexto = data.message
      } else if (typeof data === 'string') {
        respuestaTexto = data
      }

      const mensajeAgente: Mensaje = {
        id: Date.now().toString(),
        rol: 'agente',
        contenido: respuestaTexto,
        timestamp: new Date()
      }
      
      setMensajes(prev => [...prev, mensajeAgente])
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      const errorMsg: Mensaje = {
        id: Date.now().toString(),
        rol: 'agente',
        contenido: 'Lo siento, hubo un error al conectar con el servidor. Por favor intenta de nuevo.',
        timestamp: new Date()
      }
      setMensajes(prev => [...prev, errorMsg])
    } finally {
      setCargando(false)
    }
  }

  const handleEnviar = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || cargando) return

    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      rol: 'usuario',
      contenido: input,
      timestamp: new Date()
    }

    setMensajes(prev => [...prev, nuevoMensaje])
    const textoEnviado = input
    setInput('')
    
    await enviarAlAgente(textoEnviado)
  }

  const sugerencias = [
    { texto: '📊 Análisis de cartera', valor: 'Analiza mi cartera de oportunidades actual' },
    { texto: '🔍 Buscar renovaciones', valor: '¿Qué clientes tienen renovaciones próximas?' },
    { texto: '💰 Top oportunidades', valor: 'Muestra las oportunidades de mayor valor' },
    { texto: '📈 Rendimiento', valor: 'Comparativa de rendimiento por semana' },
  ]

  return (
    <div className={cn(
      "flex flex-col h-full border-l transition-colors duration-300",
      isHey ? "bg-[#1a1f2e] border-white/10" : "bg-white border-orange-100"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b flex items-center justify-between",
        isHey ? "border-white/10 bg-white/5" : "border-orange-100 bg-orange-50/50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isHey ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-gradient-to-br from-orange-400 to-red-500"
          )}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={cn("font-bold text-sm", isHey ? "text-white" : "text-gray-800")}>
              Agente Oportunidades
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className={cn("text-xs", isHey ? "text-gray-400" : "text-gray-500")}>
                En línea
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[90%]",
              msg.rol === 'usuario' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.rol === 'usuario'
                ? isHey ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-100 text-orange-600"
                : isHey ? "bg-blue-500/20 text-blue-400" : "bg-gray-100 text-gray-600"
            )}>
              {msg.rol === 'usuario' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            
            <div className={cn(
              "p-3 rounded-2xl text-sm whitespace-pre-wrap",
              msg.rol === 'usuario'
                ? isHey 
                  ? "bg-cyan-600 text-white rounded-tr-sm" 
                  : "bg-orange-500 text-white rounded-tr-sm"
                : isHey 
                  ? "bg-white/10 text-gray-200 rounded-tl-sm" 
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
            )}>
              {msg.contenido}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isHey ? "bg-blue-500/20 text-blue-400" : "bg-gray-100 text-gray-600"
            )}>
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className={cn(
              "p-3 rounded-2xl rounded-tl-sm text-sm italic",
              isHey ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"
            )}>
              Escribiendo...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input y Sugerencias */}
      <div className={cn(
        "p-4 border-t",
        isHey ? "border-white/10 bg-white/5" : "border-orange-50 bg-white"
      )}>
        {mensajes.length === 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {sugerencias.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(sug.valor)
                  // Opcionalmente enviar automáticamente:
                  // handleEnviar() // O mejor solo llenar input
                }}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  isHey 
                    ? "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-cyan-500/50" 
                    : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300"
                )}
              >
                {sug.texto}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleEnviar} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe aquí..."
            className={cn(
              "flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2",
              isHey 
                ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-cyan-500/50" 
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-orange-500/20 focus:border-orange-400"
            )}
            disabled={cargando}
          />
          <button
            type="submit"
            disabled={!input.trim() || cargando}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
              isHey 
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg shadow-orange-500/20"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
