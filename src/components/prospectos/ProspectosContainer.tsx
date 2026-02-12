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

import { generarDatosEjemplo, ProspectoOferta, PROMOTORES } from '@/data/prospectosData'

// Tipos para el chat de prospectos
interface MensajeChat {
  id: string
  tipo: 'usuario' | 'asistente'
  contenido: string
  timestamp: Date
}

// Webhook URL para el agente de prospectos
const WEBHOOK_PROSPECTOS = 'https://fjrv1818.app.n8n.cloud/webhook/Register'

// Definición de respuesta del agente
interface AgenteResponse {
  intent?: 'CREAR_PROSPECTO' | 'ACTUALIZAR_PROSPECTO'
  data?: {
    nombre?: string // Puede venir nombre para buscar
    rfc?: string
    contacto?: string
    producto?: string
    campo?: 'etapa' | 'monto' | 'producto' | 'contacto' // Para actualizaciones
    valor?: any
  }
  mensaje?: string
  output?: string // Fallback n8n
}

// Enviar mensaje al agente de prospectos
async function enviarAlAgente(mensaje: string, sessionId: string): Promise<AgenteResponse | string> {
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
    console.log('Respuesta Agente Debug:', data)

    // Intentar parsear si viene como objeto directo o array
    let rawOutput: any = data
    if (Array.isArray(data) && data.length > 0) {
      rawOutput = data[0]
    }

    // Verificar si el output es JSON string o ya es objeto
    if (rawOutput.output && typeof rawOutput.output === 'string') {
        try {
            let cleanOutput = rawOutput.output.trim();
            // Limpiar bloques de markdown si existen
            if (cleanOutput.includes('```')) {
                cleanOutput = cleanOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            
            // Intentar parsear el output string a JSON
            if (cleanOutput.startsWith('{')) {
                const parsed = JSON.parse(cleanOutput)
                return parsed as AgenteResponse
            }
        } catch (e) {
            console.error('Error parseando JSON del agente:', e)
            // Si falla, es texto normal
        }
        return rawOutput.output
    } else if (rawOutput.output) {
      // Si output ya es objeto
      return rawOutput.output as unknown as AgenteResponse
    } else if (rawOutput.mensaje) {
        return rawOutput as AgenteResponse
    }

    // Fallback general
    return JSON.stringify(rawOutput)
    
  } catch (error) {
    console.error('Error enviando al agente:', error)
    return '❌ Error de conexión. Por favor intenta de nuevo.'
  }
}

// Sugerencias rápidas para el chat
const SUGERENCIAS = [
  { texto: '➕ Crear oferta', valor: 'Quiero agregar un nuevo prospecto' },
]

interface ProspectosChatSidebarProps {
  onNuevoProspecto: (prospecto: Partial<ProspectoOferta>) => void
  onActualizarProspecto: (nombreOrRfc: string, campo: string, valor: any) => boolean
}

// Chat Sidebar para prospectos
function ProspectosChatSidebar({ onNuevoProspecto, onActualizarProspecto }: ProspectosChatSidebarProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [inputValue, setInputValue] = useState('')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: '1',
      tipo: 'asistente',
      contenido: '¡Hola! Soy tu asistente de prospectos. Puedo ayudarte a:\n\n➕ Crear ofertas de prospectos con AI\n\nEjemplo: "Quiero agregar a Juan Pérez RFC... para TDC"',
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
      // Enviar todo al agente (backend n8n)
      const respuesta = await enviarAlAgente(texto.trim(), sessionId)
      
      // Procesar respuesta
      if (typeof respuesta === 'object' && respuesta !== null) {
          // Es un JSON Estructurado
          if (respuesta.intent === 'CREAR_PROSPECTO' && respuesta.data) {
              onNuevoProspecto({
                  nombreProspecto: respuesta.data.nombre || 'Nuevo Prospecto',
                  rfc: respuesta.data.rfc,
                  familiaProducto: respuesta.data.producto || 'TDC', 
                  descripcion: `Prospecto creado por Agente IA. Contacto: ${respuesta.data.contacto}`,
              })
              agregarMensaje('asistente', respuesta.mensaje || `✅ Prospecto ${respuesta.data.nombre} creado exitosamente.`)
          } else if (respuesta.intent === 'ACTUALIZAR_PROSPECTO' && respuesta.data) {
              // Manejar actualización
              const { nombre, rfc, campo, valor } = respuesta.data
              const identificador = nombre || rfc
              
              if (identificador && campo && valor) {
                  const exito = onActualizarProspecto(identificador, campo, valor)
                  if (exito) {
                      agregarMensaje('asistente', respuesta.mensaje || `✅ Actualizado ${campo} de ${identificador} a ${valor}.`)
                  } else {
                      agregarMensaje('asistente', `⚠️ No encontré al prospecto "${identificador}" para actualizar.`)
                  }
              } else {
                   agregarMensaje('asistente', 'No pude entender qué dato actualizar.')
              }
          } else {
              // Otro intent o mensaje genérico en JSON
              agregarMensaje('asistente', respuesta.mensaje || JSON.stringify(respuesta))
          }
      } else {
          // Es texto plano (pregunta o respuesta general)
          agregarMensaje('asistente', String(respuesta))
      }

    } catch (error) {
      console.error(error)
      agregarMensaje('asistente', '❌ Hubo un error procesando tu solicitud.')
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
        <div className={cn("px-3 pb-2 flex gap-2 flex-wrap", isHey ? "border-white/10" : "border-orange-100")}>
          {SUGERENCIAS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleEnviarMensaje(sug.valor)}
              className={cn(
                "flex-1 py-2 px-3 text-xs rounded-lg transition-colors whitespace-nowrap",
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
  
  // Estado de prospectos
  const [prospectos, setProspectos] = useState<ProspectoOferta[]>(() => generarDatosEjemplo())
  
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
  
  const handleNuevoProspecto = (datos: Partial<ProspectoOferta>) => {
    const nuevoProspecto: ProspectoOferta = {
      idOferta: `OP${String(Date.now()).slice(-8)}`,
      idProspecto: `Pr${String(Date.now()).slice(-8)}`,
      rfc: datos.rfc || 'XAXX010101000',
      tipoPersona: datos.rfc?.length === 12 ? 'Persona Moral' : 'Persona Fisica',
      familiaProducto: 'TDC', // Default
      productoInteres: 'Por definir', // Default
      etapa: 'No contactado',
      campaña: 'Referencia Propia',
      montoInteres: 0,
      fechaAlta: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      nombrePromotor: PROMOTORES[Math.floor(Math.random() * PROMOTORES.length)] || 'Asignación Automática',
      descripcion: datos.descripcion || 'Prospecto creado manualmente',
      nombreProspecto: (datos as any).nombre || 'Nuevo Prospecto', // Mappear nombre desde el chat
      ...datos as any
    }
    
    setProspectos(prev => [nuevoProspecto, ...prev])
  }
  
  const handleUpdateProspecto = (nombreOrRfc: string, campo: string, valor: any): boolean => {
      const termino = nombreOrRfc.toLowerCase()
      // Buscar prospecto (puede ser por nombre o RFC)
      // Priorizar match exacto de RFC, luego autocompletar nombre
      const index = prospectos.findIndex(p => 
          p.rfc.toLowerCase().includes(termino) || 
          p.nombreProspecto.toLowerCase().includes(termino)
      )
      
      // Modificar prospecto
      const nuevosProspectos = [...prospectos]
      const prospecto = nuevosProspectos[index]

      if (!prospecto) return false
      
      // Mapear campos 'coloquiales' a reales
      if (campo === 'etapa') prospecto.etapa = valor
      else if (campo === 'monto') prospecto.montoInteres = typeof valor === 'string' ? parseFloat(valor.replace(/[^0-9.]/g, '')) : valor
      else if (campo === 'producto') {
          prospecto.familiaProducto = valor
          prospecto.productoInteres = valor
      }
      else if (campo === 'contacto') prospecto.descripcion += ` | Nuevo contacto: ${valor}`
      
      setProspectos(nuevosProspectos)
      return true
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
          <ProspectosTable filtros={filtros} data={prospectos} onUpdateProspecto={handleUpdateProspecto} />
        </div>
      </div>
      
      {/* Right: Chat sidebar */}
      <div className="w-[450px] shrink-0">
        <ProspectosChatSidebar 
            onNuevoProspecto={handleNuevoProspecto} 
            onActualizarProspecto={handleUpdateProspecto}
        />
      </div>
    </div>
  )
}
