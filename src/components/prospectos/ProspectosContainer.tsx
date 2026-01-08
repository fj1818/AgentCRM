/**
 * Prospectos Container - Split Screen Layout
 * Left: Pipeline (filters, search, table)
 * Right: Chat sidebar for prospects agent
 */

import { useState, useRef, useEffect } from 'react'
import { 
  MessageSquare, Send, Users, Search
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { ProspectosFilters } from './ProspectosFilters'
import { ProspectosTable } from './ProspectosTable'

// Tipos para el chat de prospectos
interface MensajeChat {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
  timestamp: Date
}

// Webhook URL para el agente de prospectos
const WEBHOOK_PROSPECTOS = 'https://abrahamnavarrete.app.n8n.cloud/webhook/prospectos'

// Enviar mensaje al agente de prospectos
async function enviarAlAgente(mensaje: string, sessionId: string): Promise<string> {
  try {
    const fechaActual = new Date().toISOString().split('T')[0]
    const horaActual = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    
    const response = await fetch(WEBHOOK_PROSPECTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mensaje, 
        sessionId,
        fechaActual,
        horaActual
      })
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extraer respuesta del formato de n8n
    let respuesta = ''
    if (Array.isArray(data) && data.length > 0) {
      respuesta = data[0].output || data[0].response || data[0].mensaje || JSON.stringify(data[0])
    } else if (typeof data === 'object') {
      respuesta = data.output || data.response || data.mensaje || JSON.stringify(data)
    } else {
      respuesta = String(data)
    }
    
    return respuesta || 'No pude procesar tu solicitud.'
  } catch (error) {
    console.error('Error enviando al agente:', error)
    return '❌ Error de conexión. Por favor intenta de nuevo.'
  }
}

// Sugerencias rápidas para el chat
const SUGERENCIAS = [
  { texto: '📊 Ver estadísticas', valor: '¿Cuántos prospectos tengo en cada etapa?' },
  { texto: '🔍 Buscar prospecto', valor: 'Buscar prospectos de TDC' },
]

// Chat Sidebar para prospectos
function ProspectosChatSidebar() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [inputValue, setInputValue] = useState('')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: '1',
      tipo: 'asistente',
      contenido: '¡Hola! Soy tu asistente de prospectos. Puedo ayudarte a:\n\n📊 Consultar estadísticas\n🔍 Buscar prospectos\n➕ Crear ofertas\n📈 Ver pipeline\n\n¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // SessionId persistente
  const [sessionId] = useState(() => `prospectos_${Date.now()}`)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])
  
  const agregarMensaje = (tipo: 'usuario' | 'asistente', contenido: string) => {
    setMensajes(prev => [...prev, {
      id: Date.now().toString(),
      tipo,
      contenido,
      timestamp: new Date()
    }])
  }
  
  const handleEnviarMensaje = async (texto: string) => {
    if (!texto.trim()) return
    
    agregarMensaje('usuario', texto.trim())
    setInputValue('')
    setIsLoading(true)
    
    try {
      const respuesta = await enviarAlAgente(texto.trim(), sessionId)
      agregarMensaje('asistente', respuesta)
    } catch (error) {
      agregarMensaje('asistente', '❌ Hubo un error. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className={cn(
      "flex flex-col h-full border-l",
      isHey ? "border-white/10 bg-[#1a1f2e]" : "border-orange-200 bg-white"
    )}>
      {/* Header */}
      <div className={cn(
        "px-4 py-3 border-b flex items-center gap-2",
        isHey ? "border-white/10" : "border-orange-100"
      )}>
        <MessageSquare className={cn("w-5 h-5", isHey ? "text-cyan-400" : "text-orange-500")} />
        <span className={cn("font-semibold text-sm", isHey ? "text-white" : "text-gray-800")}>
          Agente Prospectos
        </span>
        <span className={cn(
          "ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
          isHey ? "bg-cyan-500/20 text-cyan-400" : "bg-green-100 text-green-600"
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          En línea
        </span>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {mensajes.map(msg => (
          <div 
            key={msg.id}
            className={cn(
              "p-3 rounded-xl text-sm",
              msg.tipo === 'asistente'
                ? isHey ? "bg-white/5 text-gray-300" : "bg-orange-50 text-gray-600"
                : isHey ? "bg-cyan-500/20 text-cyan-100 ml-6" : "bg-orange-100 text-gray-700 ml-6"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.contenido}</p>
          </div>
        ))}
        
        {isLoading && (
          <div className={cn(
            "p-3 rounded-xl",
            isHey ? "bg-white/5" : "bg-orange-50"
          )}>
            <div className="flex gap-1">
              <div className={cn("w-2 h-2 rounded-full animate-bounce", isHey ? "bg-cyan-400" : "bg-orange-400")} style={{ animationDelay: '0ms' }} />
              <div className={cn("w-2 h-2 rounded-full animate-bounce", isHey ? "bg-cyan-400" : "bg-orange-400")} style={{ animationDelay: '150ms' }} />
              <div className={cn("w-2 h-2 rounded-full animate-bounce", isHey ? "bg-cyan-400" : "bg-orange-400")} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Sugerencias */}
      {mensajes.length <= 2 && (
        <div className={cn("px-3 pb-2 flex gap-2", isHey ? "border-white/10" : "border-orange-100")}>
          {SUGERENCIAS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleEnviarMensaje(sug.valor)}
              className={cn(
                "flex-1 py-2 px-3 text-xs rounded-lg transition-colors",
                isHey 
                  ? "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10" 
                  : "bg-orange-50 text-gray-600 hover:bg-orange-100 border border-orange-200"
              )}
            >
              {sug.texto}
            </button>
          ))}
        </div>
      )}
      
      {/* Input */}
      <div className={cn("p-3 border-t", isHey ? "border-white/10" : "border-orange-100")}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleEnviarMensaje(inputValue)
              }
            }}
            placeholder="Escribe aquí..."
            className={cn(
              "flex-1 px-3 py-2 text-sm rounded-lg border",
              isHey 
                ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500" 
                : "bg-orange-50 border-orange-200 text-gray-800 placeholder:text-gray-400"
            )}
          />
          <button
            onClick={() => handleEnviarMensaje(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "px-3 py-2 rounded-lg transition-colors",
              inputValue.trim() && !isLoading
                ? isHey ? "bg-cyan-500 text-white hover:bg-cyan-600" : "bg-orange-500 text-white hover:bg-orange-600"
                : isHey ? "bg-white/10 text-gray-500" : "bg-gray-200 text-gray-400"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Tipos de filtros
export interface FiltrosProspectos {
  tipoPersona: string
  campana: string
  etapa: string
  familiaProducto: string
  producto: string
  busqueda: string
}

// Componente principal
export function ProspectosContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  const [filtros, setFiltros] = useState<FiltrosProspectos>({
    tipoPersona: '',
    campana: '',
    etapa: '',
    familiaProducto: '',
    producto: '',
    busqueda: ''
  })
  
  const handleFiltroChange = (campo: keyof FiltrosProspectos, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }
  
  return (
    <div className={cn(
      "flex h-full",
      isHey 
        ? "bg-gradient-to-b from-[#1a1f2e] via-[#1f2537] to-[#232a3c]" 
        : "bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30"
    )}>
      {/* Left: Pipeline content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <Users className={cn("w-8 h-8", isHey ? "text-cyan-400" : "text-orange-500")} />
          <h1 className={cn(
            "text-2xl font-bold",
            isHey ? "text-white" : "text-gray-800"
          )}>
            Tubería de Prospectos
          </h1>
        </div>
        
        {/* Search bar */}
        <div className="mb-4">
          <div className={cn(
            "relative",
            isHey ? "text-gray-300" : "text-gray-600"
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
            <input
              type="text"
              placeholder="Buscar por RFC, nombre, producto..."
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl border text-sm",
                isHey 
                  ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500" 
                  : "bg-white border-orange-200 text-gray-800 placeholder:text-gray-400"
              )}
            />
          </div>
        </div>
        
        {/* Filters */}
        <ProspectosFilters 
          filtros={filtros} 
          onFiltroChange={handleFiltroChange} 
        />
        
        {/* Table */}
        <div className="mt-4">
          <ProspectosTable filtros={filtros} />
        </div>
      </div>
      
      {/* Right: Chat sidebar */}
      <div className="w-[450px] shrink-0">
        <ProspectosChatSidebar />
      </div>
    </div>
  )
}
