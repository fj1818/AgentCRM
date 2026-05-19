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
import { useUIStore, useEventosStore } from '@/stores'
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

// Tipos para el scheduler
interface MensajeChat {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
  datosAgendados?: DatosEvento
  timestamp: Date
}

interface DatosEvento {
  tipo: 'reunion' | 'tarea'
  nombre: string
  fecha: string
  hora?: string
  duracion: number
}

// Respuesta estructurada de n8n AI
interface RespuestaIA {
  tipo: 'reunion' | 'tarea' | null
  nombre: string | null
  fecha: string | null
  hora: string | null
  duracion: number | null
  completo: boolean
  mensaje: string
}

// Estado acumulado de la conversación (local)
interface EstadoConversacion {
  tipo?: 'reunion' | 'tarea'
  nombre?: string
  fecha?: string
  hora?: string
  duracion?: number
}

// Webhook URL para el scheduler
const WEBHOOK_SCHEDULER = 'https://abrahamnavarrete.app.n8n.cloud/webhook/scheduler'

// Enviar mensaje a n8n y recibir respuesta estructurada
async function enviarAlScheduler(mensaje: string, sessionId: string): Promise<RespuestaIA> {
  try {
    // Obtener fecha actual para que n8n pueda interpretar "hoy", "mañana", etc.
    const fechaActual = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const horaActual = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    
    console.log('📤 Enviando a n8n:', { mensaje, sessionId, fechaActual, horaActual })
    const response = await fetch(WEBHOOK_SCHEDULER, {
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
    console.log('📥 Respuesta de n8n:', data)
    
    // Intentar parsear la respuesta como JSON
    let respuestaIA: RespuestaIA
    
    // Función auxiliar para extraer el objeto de respuesta
    const extraerRespuesta = (obj: unknown): RespuestaIA | null => {
      if (!obj || typeof obj !== 'object') return null
      const o = obj as Record<string, unknown>
      
      // Si tiene los campos esperados directamente
      if ('tipo' in o || 'completo' in o || 'mensaje' in o) {
        return {
          tipo: (o.tipo as RespuestaIA['tipo']) ?? null,
          nombre: (o.nombre as string) ?? null,
          fecha: (o.fecha as string) ?? null,
          hora: (o.hora as string) ?? null,
          duracion: (o.duracion as number) ?? null,
          completo: (o.completo as boolean) ?? false,
          mensaje: (o.mensaje as string) ?? ''
        }
      }
      return null
    }
    
    // 1. Si es un array, tomar el primer elemento
    let dataToProcess = data
    if (Array.isArray(data) && data.length > 0) {
      console.log('📥 Respuesta es un array, tomando primer elemento')
      dataToProcess = data[0]
    }
    
    // 2. Intentar parsear directamente
    let resultado = extraerRespuesta(dataToProcess)
    
    // 3. Si no funciona, buscar en campos comunes
    if (!resultado) {
      const campos = ['output', 'text', 'mensaje', 'response', 'result', 'data']
      for (const campo of campos) {
        const valor = dataToProcess[campo]
        if (valor) {
          // Si es string, intentar parsearlo como JSON
          if (typeof valor === 'string') {
            const textoLimpio = valor
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim()
            try {
              const parsed = JSON.parse(textoLimpio)
              resultado = extraerRespuesta(parsed)
              if (resultado) break
            } catch {
              // Continuar buscando
            }
          } else if (typeof valor === 'object') {
            // Si el campo es un objeto, buscar dentro de él
            resultado = extraerRespuesta(valor)
            if (resultado) break
            // También intentar si tiene un campo 'output' anidado
            if (valor && typeof valor === 'object' && 'output' in (valor as object)) {
              const nested = (valor as Record<string, unknown>).output
              if (typeof nested === 'string') {
                try {
                  const parsed = JSON.parse(nested.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
                  resultado = extraerRespuesta(parsed)
                  if (resultado) break
                } catch { /* continuar */ }
              }
            }
          }
        }
      }
    }
    
    // 3. Si aún no hay resultado, crear respuesta de error
    if (resultado) {
      respuestaIA = resultado
    } else {
      console.warn('⚠️ No se pudo parsear la respuesta de n8n:', data)
      respuestaIA = {
        tipo: null,
        nombre: null,
        fecha: null,
        hora: null,
        duracion: null,
        completo: false,
        mensaje: 'No pude procesar tu solicitud. Por favor intenta de nuevo.'
      }
    }
    
    return respuestaIA
  } catch (error) {
    console.error('Error enviando al scheduler:', error)
    return {
      tipo: null,
      nombre: null,
      fecha: null,
      hora: null,
      duracion: null,
      completo: false,
      mensaje: '❌ Error de conexión. Por favor intenta de nuevo.'
    }
  }
}

// Sugerencias rápidas
const SUGERENCIAS = [
  { texto: '📅 Agendar reunión', valor: 'Quiero agendar una reunión' },
  { texto: '✅ Crear tarea', valor: 'Quiero crear una tarea' },
]

interface ChatSidebarProps {
  onEventoCreado?: (fecha: Date) => void
}

// Chat Sidebar conversacional
function ChatSidebar({ onEventoCreado }: ChatSidebarProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [inputValue, setInputValue] = useState('')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: '1',
      tipo: 'asistente',
      contenido: '¡Hola! Soy tu asistente de agenda. Puedo ayudarte a:\n\n📅 Agendar reuniones\n✅ Crear tareas\n\nEscríbeme lo que necesitas, por ejemplo:\n"Reunión con Juan mañana a las 10 por 60 minutos"',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // SessionId persistente para memoria de conversación en n8n
  const [sessionId] = useState(() => `scheduler_${Date.now()}`)
  
  // Estado local para acumular datos entre mensajes
  const [estadoConversacion, setEstadoConversacion] = useState<EstadoConversacion>({})
  
  // Hook para agregar eventos al store compartido
  const agregarEventoStore = useEventosStore((state) => state.agregarEvento)
  
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
    
    console.log('🚀 Enviando mensaje:', texto.trim())
    agregarMensaje('usuario', texto.trim())
    setInputValue('')
    setIsLoading(true)
    
    try {
      // Enviar a n8n para interpretar el mensaje
      const respuesta = await enviarAlScheduler(texto.trim(), sessionId)
      console.log('📊 Respuesta IA:', respuesta)
      
      // Combinar datos nuevos de n8n con estado existente (local)
      const estadoActualizado: EstadoConversacion = { ...estadoConversacion }
      if (respuesta.tipo) estadoActualizado.tipo = respuesta.tipo
      if (respuesta.nombre) estadoActualizado.nombre = respuesta.nombre
      if (respuesta.fecha) estadoActualizado.fecha = respuesta.fecha
      if (respuesta.hora) estadoActualizado.hora = respuesta.hora
      if (respuesta.duracion) estadoActualizado.duracion = respuesta.duracion
      
      setEstadoConversacion(estadoActualizado)
      console.log('💾 Estado acumulado:', estadoActualizado)
      
      // Verificar si tenemos todos los datos necesarios
      const datosCompletos = 
        estadoActualizado.tipo && 
        estadoActualizado.nombre && 
        estadoActualizado.fecha && 
        estadoActualizado.duracion &&
        (estadoActualizado.tipo === 'tarea' || estadoActualizado.hora) // hora solo requerida para reuniones
      
      if (datosCompletos) {
        // Tenemos todos los datos, crear el evento
        const datos: DatosEvento = {
          tipo: estadoActualizado.tipo!,
          nombre: estadoActualizado.nombre!,
          fecha: estadoActualizado.fecha!,
          hora: estadoActualizado.hora,
          duracion: estadoActualizado.duracion!
        }
        
        // Agregar evento al store compartido
        agregarEventoStore({
          tipo: datos.tipo,
          nombre: datos.nombre,
          fecha: datos.fecha,
          hora: datos.hora,
          duracion: datos.duracion,
          esPlaneada: false // Tareas creadas por el agente son NO PLANEADAS
        })
        
        // Formatear confirmación
        const fechaObj = new Date(datos.fecha + 'T12:00:00')
        
        // Actualizar vista si se proporcionó el callback
        if (onEventoCreado) {
          onEventoCreado(fechaObj)
        }
        const fechaFormateada = fechaObj.toLocaleDateString('es-MX', { 
          weekday: 'long', day: 'numeric', month: 'long' 
        })
        const tipoTexto = datos.tipo === 'reunion' ? 'Reunión' : 'Tarea'
        const horaTexto = datos.hora ? ` a las ${datos.hora}` : ''
        const confirmacion = `✅ ${tipoTexto} agendada:\n\n📝 ${datos.nombre}\n📅 ${fechaFormateada}${horaTexto}\n⏱️ ${datos.duracion} minutos`
        
        agregarMensaje('asistente', confirmacion, datos)
        
        // Reiniciar estado para nuevo evento
        setEstadoConversacion({})
      } else {
        // Mostrar lo que extrajo n8n o pedir lo faltante
        const faltantes: string[] = []
        if (!estadoActualizado.tipo) faltantes.push('tipo (reunión o tarea)')
        if (!estadoActualizado.nombre) faltantes.push('nombre')
        if (!estadoActualizado.fecha) faltantes.push('fecha')
        if (estadoActualizado.tipo === 'reunion' && !estadoActualizado.hora) faltantes.push('hora')
        if (!estadoActualizado.duracion) faltantes.push('duración')
        
        // Usar mensaje de n8n si es útil, sino generar pregunta
        const mensaje = respuesta.mensaje && !respuesta.mensaje.includes('null') 
          ? respuesta.mensaje 
          : `Me falta: ${faltantes.join(', ')}. ¿Puedes decirme?`
        
        agregarMensaje('asistente', mensaje)
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
  
  // Estado compartido de fecha para sincronizar chat y cronograma
  // Inicializamos con la fecha actual REAL (hoy) para que coincida con el chat
  const [fechaActual, setFechaActual] = useState(new Date())
  
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
            <CronogramaDiario 
              fechaActual={fechaActual}
              onFechaChange={setFechaActual}
            />
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
        <ChatSidebar onEventoCreado={setFechaActual} />
      </div>
    </div>
  )
}
