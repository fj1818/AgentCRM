/**
 * Tareas Container - Split Screen Layout
 * Left: Accordion menus (Tareas, Agenda)
 * Right: Chat sidebar
 */

import { useState, useRef, useEffect } from 'react'
import { 
  ChevronDown, ChevronRight, Calendar, 
  MessageSquare, Clock, Send
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { AgendaCalendar } from './AgendaCalendar'
import { CronogramaDiario } from './CronogramaDiario'



// Componente Accordion
function AccordionItem({ 
  titulo, 
  icono: Icono, 
  children, 
  defaultOpen = false 
}: { 
  titulo: string
  icono: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  return (
    <div className={cn(
      "border rounded-xl overflow-hidden",
      isHey ? "border-white/10 bg-white/5" : "border-orange-200 bg-white"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-colors",
          isHey 
            ? "hover:bg-white/10" 
            : "hover:bg-orange-50"
        )}
      >
        <div className="flex items-center gap-3">
          <Icono className={cn("w-5 h-5", isHey ? "text-cyan-400" : "text-orange-500")} />
          <span className={cn("font-semibold", isHey ? "text-white" : "text-gray-800")}>
            {titulo}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className={cn("w-5 h-5", isHey ? "text-gray-400" : "text-gray-500")} />
        ) : (
          <ChevronRight className={cn("w-5 h-5", isHey ? "text-gray-400" : "text-gray-500")} />
        )}
      </button>
      
      {isOpen && (
        <div className={cn(
          "border-t px-4 py-3",
          isHey ? "border-white/10" : "border-orange-100"
        )}>
          {children}
        </div>
      )}
    </div>
  )
}

// Webhook URL para el scheduler
const WEBHOOK_SCHEDULER = 'https://abrahamnavarrete.app.n8n.cloud/webhook/scheduler'

// Tipos para el scheduler
interface MensajeChat {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
  datosAgendados?: {
    tipo: 'reunion' | 'tarea'
    nombre: string
    fecha: string
    hora?: string
    duracion: string
  }
  timestamp: Date
}

// Enviar mensaje al webhook de n8n (el agente procesará el mensaje)
async function enviarAlScheduler(mensaje: string): Promise<{ exito: boolean; respuesta?: string }> {
  try {
    const response = await fetch(WEBHOOK_SCHEDULER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensaje,
        sessionId: `scheduler_${Date.now()}`
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return { exito: true, respuesta: data.output || data.mensaje || 'Evento procesado' }
    }
    return { exito: false }
  } catch (error) {
    console.error('Error enviando al scheduler:', error)
    return { exito: false }
  }
}

// Sugerencias rápidas
const SUGERENCIAS = [
  { texto: '📅 Agendar reunión', valor: 'Quiero agendar una reunión' },
  { texto: '✅ Crear tarea', valor: 'Quiero crear una tarea' },
]

// Chat Sidebar conversacional
function ChatSidebar() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [inputValue, setInputValue] = useState('')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: '1',
      tipo: 'asistente',
      contenido: '¡Hola! Soy tu asistente de agenda. Puedo ayudarte a:\n\n📅 Agendar reuniones\n✅ Crear tareas\n\nEscríbeme lo que necesitas, por ejemplo:\n"Agendar reunión con Juan mañana a las 10 por 60 minutos"',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])
  
  const agregarMensaje = (tipo: 'usuario' | 'asistente', contenido: string, datosAgendados?: MensajeChat['datosAgendados']) => {
    setMensajes(prev => [...prev, {
      id: Date.now().toString(),
      tipo,
      contenido,
      datosAgendados,
      timestamp: new Date()
    }])
  }
  
  const handleEnviarMensaje = async (texto: string) => {
    if (!texto.trim()) return
    
    agregarMensaje('usuario', texto.trim())
    setInputValue('')
    setIsLoading(true)
    
    try {
      // Enviar mensaje crudo a n8n - el agente procesará todo
      const resultado = await enviarAlScheduler(texto.trim())
      
      if (resultado.exito) {
        agregarMensaje('asistente', resultado.respuesta || '✅ Evento procesado correctamente')
      } else {
        agregarMensaje('asistente', '❌ Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error)
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
          Asistente de Agenda
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
            {msg.datosAgendados && (
              <div className={cn(
                "mt-2 p-2 rounded-lg text-xs",
                isHey ? "bg-green-500/20 text-green-300" : "bg-green-50 text-green-700"
              )}>
                ✓ Enviado a n8n
              </div>
            )}
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

export function TareasContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  return (
    <div className={cn(
      "flex h-full",
      isHey 
        ? "bg-gradient-to-b from-[#1a1f2e] via-[#1f2537] to-[#232a3c]" 
        : "bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30"
    )}>
      {/* Left: Main content with accordions */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className={cn(
          "text-2xl font-bold mb-6",
          isHey ? "text-white" : "text-gray-800"
        )}>
          Tareas y Agenda
        </h1>
        
        <div className="space-y-4">
          {/* Cronograma del día */}
          <AccordionItem 
            titulo="Mi Día" 
            icono={Clock}
            defaultOpen={true}
          >
            <CronogramaDiario />
          </AccordionItem>
          
          {/* Accordion: Agenda */}
          <AccordionItem 
            titulo="Agenda Semanal" 
            icono={Calendar}
            defaultOpen={false}
          >
            <AgendaCalendar />
          </AccordionItem>
        </div>
      </div>
      
      {/* Right: Chat sidebar - expanded */}
      <div className="w-[450px] shrink-0">
        <ChatSidebar />
      </div>
    </div>
  )
}
