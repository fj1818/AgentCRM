import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { ProspectoOferta } from '@/data/prospectosData'

interface DetalleProspectoModalProps {
  prospecto: ProspectoOferta
  onClose: () => void
  onUpdateProspecto: (id: string, updates: Partial<ProspectoOferta>) => void
}

interface MensajeAgent {
  id: string
  tipo: 'usuario' | 'agente'
  texto: string
  timestamp: Date
}

export function DetalleProspectoModal({ prospecto, onClose, onUpdateProspecto }: DetalleProspectoModalProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  const [mensajes, setMensajes] = useState<MensajeAgent[]>([
    {
      id: 'welcome',
      tipo: 'agente',
      texto: `Hola, estoy aquí para ayudarte a gestionar a ${prospecto.nombrePromotor}. Puedes pedirme cosas como:\n\n• "Cambia la etapa a Interesado"\n• "Actualiza el monto a 1.5 millones"`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleEnviar = () => {
    if (!inputValue.trim()) return

    const textoUsuario = inputValue.trim()
    
    // Agregar mensaje usuario
    setMensajes(prev => [...prev, {
      id: Date.now().toString(),
      tipo: 'usuario',
      texto: textoUsuario,
      timestamp: new Date()
    }])
    setInputValue('')

    // Procesar comando (Agent Logic)
    setTimeout(() => {
      procesarComando(textoUsuario)
    }, 500)
  }

  const procesarComando = (texto: string) => {
    const textoLower = texto.toLowerCase()
    let respuesta = ''

    // 1. Intentar cambiar etapa
    if (textoLower.includes('etapa') || textoLower.includes('estatus')) {
      const etapasValidas = ['No contactado', 'En negociación', 'Interesado', 'Descartado', 'Convertido']
      const stagesMap: Record<string, string> = {
        'no contactado': 'No contactado',
        'negociacion': 'En negociación',
        'negociación': 'En negociación',
        'interesado': 'Interesado',
        'descartado': 'Descartado',
        'convertido': 'Convertido',
        'venta': 'Convertido',
        'cerrado': 'Convertido'
      }

      let nuevaEtapa = ''
      
      // Buscar coincidencia exacta o aproximada
      for (const key in stagesMap) {
        if (textoLower.includes(key)) {
          nuevaEtapa = stagesMap[key] || ''
          break
        }
      }

      // Si no encontró en el mapa, buscar en el array original
      if (!nuevaEtapa) {
        etapasValidas.forEach(etapa => {
          if (textoLower.includes(etapa.toLowerCase())) {
            nuevaEtapa = etapa
          }
        })
      }

      if (nuevaEtapa) {
        onUpdateProspecto(prospecto.idProspecto, { etapa: nuevaEtapa as any })
        respuesta = `✅ Listo. He actualizado la etapa a "${nuevaEtapa}".`
      } else {
        respuesta = `❌ No reconozco esa etapa. Las etapas válidas son:\n\n• ${etapasValidas.join('\n• ')}`
      }
    }
    // 2. Intentar cambiar monto
    else if (textoLower.includes('monto') || textoLower.includes('cantidad') || textoLower.includes('precio') || textoLower.includes('valor')) {
      // Extraer número
      const montoMatch = texto.match(/\$?\s*([0-9,]+(\.[0-9]+)?)\s*(mil(?:lones?)?|millones?|m)?/i)
      
      if (montoMatch) {
         let monto = parseFloat(montoMatch[1]!.replace(/,/g, ''))
         const unidad = (montoMatch[3] || '').toLowerCase()
         
         if (unidad.includes('mil') || unidad === 'm') {
           if (unidad.includes('millon')) monto *= 1000000
           else monto *= 1000
         } else if (unidad.includes('millon')) {
            monto *= 1000000
         }

         if (monto < 0) {
           respuesta = `⚠️ No puedo asignar un monto negativo ($${monto}).`
         } else {
           onUpdateProspecto(prospecto.idProspecto, { montoInteres: monto })
           respuesta = `✅ Entendido. He actualizado el monto de interés a ${formatCurrency(monto)}.`
         }
      } else {
        respuesta = '❓ No entendí el monto. Intenta escribirlo así: "1.5 millones" o "$500,000".'
      }
    }
    // 3. Fallback
    else {
      respuesta = '🤔 No estoy seguro de qué hacer. Puedo ayudarte a cambiar la "etapa" o el "monto" del prospecto.'
    }

    setMensajes(prev => [...prev, {
      id: Date.now().toString(),
      tipo: 'agente',
      texto: respuesta,
      timestamp: new Date()
    }])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-[95vw] h-[90vh] flex overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200",
        isHey ? "bg-[#1a1f2e] border border-white/10" : "bg-white border border-gray-100"
      )}>
        
        {/* Left Panel: Details (Scrollable) */}
        <div className="w-2/3 flex flex-col border-r border-gray-100 dark:border-white/10">
           {/* Header */}
          <div className={cn(
            "px-6 py-4 flex items-center justify-between border-b shrink-0",
            isHey ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50/50"
          )}>
            <div>
              <h2 className={cn("text-lg font-bold", isHey ? "text-white" : "text-gray-900")}>
                Detalle de Prospecto
              </h2>
              <p className={cn("text-xs mt-0.5", isHey ? "text-gray-400" : "text-gray-500")}>
                ID: {prospecto.idProspecto}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Key Info Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className={cn(
                "p-4 rounded-xl border",
                isHey ? "bg-white/5 border-white/10" : "bg-blue-50/50 border-blue-100"
              )}>
                <span className={cn("text-xs block mb-1", isHey ? "text-gray-400" : "text-blue-600/80")}>
                  Producto Interés
                </span>
                <div className={cn("font-semibold text-lg", isHey ? "text-cyan-400" : "text-gray-900")}>
                  {prospecto.productoInteres}
                </div>
                <div className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>
                  {prospecto.familiaProducto}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "p-4 rounded-xl border",
                  isHey ? "bg-white/5 border-white/10" : "bg-emerald-50/50 border-emerald-100"
                )}>
                  <span className={cn("text-xs block mb-1", isHey ? "text-gray-400" : "text-emerald-600/80")}>
                    Monto Interés
                  </span>
                  <div className={cn("font-semibold text-lg", isHey ? "text-emerald-400" : "text-green-700")}>
                    {formatCurrency(prospecto.montoInteres)}
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-xl border",
                  isHey ? "bg-white/5 border-white/10" : "bg-purple-50/50 border-purple-100"
                )}>
                  <span className={cn("text-xs block mb-1", isHey ? "text-gray-400" : "text-purple-600/80")}>
                    Etapa Actual
                  </span>
                  <div className={cn("font-semibold text-lg truncate", isHey ? "text-white" : "text-gray-900")}>
                    {prospecto.etapa}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-6">
              <h3 className={cn("text-sm font-medium mb-2", isHey ? "text-gray-300" : "text-gray-700")}>
                Descripción
              </h3>
              <div className={cn(
                "p-4 rounded-xl border min-h-[100px] whitespace-pre-wrap text-sm leading-relaxed",
                isHey ? "bg-white/5 border-white/10 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
              )}>
                {prospecto.descripcion || "Sin descripción disponible para este prospecto."}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t" style={{ borderColor: isHey ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
              <div>
                <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>Promotor</span>
                <span className={cn("text-sm font-medium", isHey ? "text-gray-300" : "text-gray-700")}>{prospecto.nombrePromotor}</span>
              </div>
              <div>
                <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>Campaña</span>
                <span className={cn("text-sm font-medium", isHey ? "text-gray-300" : "text-gray-700")}>{prospecto.campaña}</span>
              </div>
              <div>
                <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>RFC</span>
                <span className={cn("text-sm font-mono", isHey ? "text-gray-300" : "text-gray-700")}>{prospecto.rfc}</span>
              </div>
              <div>
                <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>Fecha Alta</span>
                <span className={cn("text-sm font-medium", isHey ? "text-gray-300" : "text-gray-700")}>{prospecto.fechaAlta}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Agent Chat */}
        <div className={cn(
          "w-1/3 flex flex-col",
          isHey ? "bg-black/20" : "bg-gray-50/50"
        )}>
          {/* Chat Header */}
          <div className={cn(
            "px-6 py-4 flex items-center justify-between border-b shrink-0",
            isHey ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg", isHey ? "bg-cyan-500/20" : "bg-orange-100")}>
                <Bot className={cn("w-4 h-4", isHey ? "text-cyan-400" : "text-orange-600")} />
              </div>
              <h3 className={cn("font-semibold", isHey ? "text-white" : "text-gray-900")}>
                Agente CRM
              </h3>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-full transition-colors",
                isHey ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-400"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mensajes.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.tipo === 'usuario' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                  msg.tipo === 'usuario' 
                    ? (isHey ? "bg-cyan-600 text-white" : "bg-orange-500 text-white")
                    : (isHey ? "bg-white/10 text-gray-200" : "bg-white border text-gray-700 shadow-sm")
                )}>
                  {msg.texto}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className={cn(
            "p-4 border-t shrink-0",
            isHey ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"
          )}>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
                placeholder="Escribe instruccion: 'Cambia etapa a...'"
                className={cn(
                  "w-full pl-4 pr-12 py-3 rounded-xl border outline-none transition-all",
                  isHey 
                    ? "bg-black/20 border-white/10 text-white focus:border-cyan-500/50" 
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-orange-500"
                )}
              />
              <button
                onClick={handleEnviar}
                disabled={!inputValue.trim()}
                className={cn(
                  "absolute right-2 top-2 p-1.5 rounded-lg transition-colors",
                  inputValue.trim()
                    ? (isHey ? "text-cyan-400 hover:bg-white/10" : "text-orange-600 hover:bg-orange-100")
                    : "text-gray-400"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
