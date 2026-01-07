/**
 * Cotizador de Créditos - Estilo Chat
 * Chat conversacional para cotización de préstamos
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Calculator, Sparkles, RefreshCw, PlusCircle, Home, Car, Wallet } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import {
  enviarACotizador,
  calcularCotizacion,
  PRODUCTOS_CREDITO,
  type ResultadoCotizacion,
  type TipoCredito,
} from '@/services/cotizadorService'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'asistente'
  texto: string
  cotizacion?: ResultadoCotizacion
  timestamp: Date
}

// Sugerencias para el chat del cotizador
const SUGERENCIAS_INICIO = [
  { texto: 'Cotizar Hipoteca', icon: Home, valor: 'Quiero cotizar un crédito hipotecario' },
  { texto: 'Cotizar Auto', icon: Car, valor: 'Quiero cotizar un crédito de auto' },
  { texto: 'Préstamo Personal', icon: Wallet, valor: 'Quiero cotizar un préstamo personal' },
]

// Componente para mostrar resultados de cotización
function ResultadoCotizacionCard({ cotizacion }: { cotizacion: ResultadoCotizacion }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [mostrarTabla, setMostrarTabla] = useState(false)
  
  return (
    <div className={cn(
      "mt-3 rounded-xl overflow-hidden border",
      isHey ? "border-white/10 bg-white/5" : "border-orange-200 bg-orange-50/50"
    )}>
      {/* Resumen principal */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", isHey ? "text-gray-400" : "text-gray-600")}>
            {cotizacion.producto}
          </span>
          <span className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>
            Tasa: {cotizacion.tasaAnual}% anual
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>Pago Mensual</p>
            <p className={cn("text-2xl font-bold", isHey ? "text-cyan-400" : "text-orange-600")}>
              ${cotizacion.pagoMensual.toLocaleString('es-MX')}
            </p>
          </div>
          <div>
            <p className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>Monto a Financiar</p>
            <p className={cn("text-lg font-semibold", isHey ? "text-white" : "text-gray-800")}>
              ${cotizacion.montoFinanciar.toLocaleString('es-MX')}
            </p>
          </div>
        </div>
        
        {cotizacion.enganche > 0 && (
          <div className={cn("pt-3 border-t", isHey ? "border-white/10" : "border-orange-200")}>
            <p className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>Enganche</p>
            <p className={cn("font-semibold", isHey ? "text-green-400" : "text-green-600")}>
              ${cotizacion.enganche.toLocaleString('es-MX')}
            </p>
          </div>
        )}
        
        <div className={cn("pt-3 border-t grid grid-cols-2 gap-4", isHey ? "border-white/10" : "border-orange-200")}>
          <div>
            <p className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>Total a Pagar</p>
            <p className={cn("font-semibold", isHey ? "text-white" : "text-gray-800")}>
              ${cotizacion.totalAPagar.toLocaleString('es-MX')}
            </p>
          </div>
          <div>
            <p className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>Intereses</p>
            <p className={cn("font-semibold", isHey ? "text-red-400" : "text-red-600")}>
              ${cotizacion.interesesTotales.toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Toggle para tabla de amortización */}
      <button
        onClick={() => setMostrarTabla(!mostrarTabla)}
        className={cn(
          "w-full py-2 text-xs font-medium border-t transition-colors",
          isHey 
            ? "border-white/10 text-gray-400 hover:bg-white/5" 
            : "border-orange-200 text-gray-600 hover:bg-orange-100"
        )}
      >
        {mostrarTabla ? 'Ocultar' : 'Ver'} tabla de amortización ({cotizacion.plazoMeses} meses)
      </button>
      
      {/* Tabla de amortización */}
      {mostrarTabla && cotizacion.tablaAmortizacion.length > 0 && (
        <div className={cn("border-t overflow-x-auto max-h-64", isHey ? "border-white/10" : "border-orange-200")}>
          <table className="w-full text-xs">
            <thead className={cn("sticky top-0", isHey ? "bg-[#1a1f2e]" : "bg-orange-100")}>
              <tr className={cn(isHey ? "text-gray-400" : "text-gray-600")}>
                <th className="px-3 py-2 text-left">Mes</th>
                <th className="px-3 py-2 text-right">Pago</th>
                <th className="px-3 py-2 text-right">Capital</th>
                <th className="px-3 py-2 text-right">Interés</th>
                <th className="px-3 py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {cotizacion.tablaAmortizacion.map((fila) => (
                <tr 
                  key={fila.mes}
                  className={cn("border-t", isHey ? "border-white/5 text-gray-300" : "border-gray-100 text-gray-700")}
                >
                  <td className="px-3 py-1.5">{fila.mes}</td>
                  <td className="px-3 py-1.5 text-right">${fila.pagoMensual.toLocaleString('es-MX')}</td>
                  <td className="px-3 py-1.5 text-right">${fila.capital.toLocaleString('es-MX')}</td>
                  <td className="px-3 py-1.5 text-right">${fila.interes.toLocaleString('es-MX')}</td>
                  <td className="px-3 py-1.5 text-right">${fila.saldo.toLocaleString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function CotizadorContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [contexto, setContexto] = useState<{ tipoCredito?: TipoCredito }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])
  
  // Procesar mensaje y detectar si es una cotización
  const procesarMensaje = (texto: string): { respuesta: string; cotizacion?: ResultadoCotizacion } => {
    // Detectar tipo de crédito en el mensaje
    const textoLower = texto.toLowerCase()
    let tipoCredito: TipoCredito | null = null
    
    if (textoLower.includes('hipotec') || textoLower.includes('casa') || textoLower.includes('vivienda')) {
      tipoCredito = 'hipotecario'
    } else if (textoLower.includes('auto') || textoLower.includes('carro') || textoLower.includes('coche') || textoLower.includes('vehiculo')) {
      tipoCredito = 'auto'
    } else if (textoLower.includes('personal') || textoLower.includes('prestamo')) {
      tipoCredito = 'personal'
    }
    
    // Si no detectamos tipo en el mensaje actual, usar el del contexto
    if (!tipoCredito && contexto.tipoCredito) {
      tipoCredito = contexto.tipoCredito
    }
    
    // Guardar tipo en contexto si lo detectamos
    if (tipoCredito) {
      setContexto(prev => ({ ...prev, tipoCredito }))
    }
    
    // Detectar montos (números con o sin comas)
    const montoMatch = texto.match(/\$?\s*([0-9,]+(?:\.[0-9]+)?)\s*(mil(?:lones?)?|millones?|pesos|mxn)?/i)
    let monto = 0
    if (montoMatch && montoMatch[1]) {
      monto = parseFloat(montoMatch[1].replace(/,/g, ''))
      const unidad = montoMatch[2]?.toLowerCase() ?? ''
      if (unidad.includes('millon')) monto *= 1000000
      else if (unidad.includes('mil')) monto *= 1000
    }
    
    // Detectar plazos (años/anos/meses)
    const plazoMatch = texto.match(/(\d+)\s*(a[ñn]os?|meses?)/i)
    let plazo = 0
    if (plazoMatch && plazoMatch[1] && plazoMatch[2]) {
      plazo = parseInt(plazoMatch[1])
      if (plazoMatch[2].toLowerCase().startsWith('a')) { // años o anos
        plazo *= 12
      }
    }
    
    // Detectar enganche
    const engancheMatch = texto.match(/enganche[:\s]+\$?\s*([0-9,]+)/i)
    const enganche = engancheMatch && engancheMatch[1] ? parseFloat(engancheMatch[1].replace(/,/g, '')) : 0
    
    // Si tenemos suficiente info, calcular cotización
    if (tipoCredito && monto > 0 && plazo > 0) {
      const cotizacion = calcularCotizacion({
        tipoCredito,
        monto,
        plazo,
        enganche,
      })
      return {
        respuesta: cotizacion.error || cotizacion.mensaje || '¡Tu cotización está lista!',
        cotizacion: cotizacion.error ? undefined : cotizacion,
      }
    }
    
    // Si tenemos tipo pero faltan datos, dar instrucciones
    if (tipoCredito) {
      const config = PRODUCTOS_CREDITO[tipoCredito]
      const plazosTexto = tipoCredito === 'hipotecario'
        ? '10, 15, 20, 25 o 30 años'
        : tipoCredito === 'auto'
          ? '12, 24, 36, 48 o 60 meses'
          : '12, 18 o 24 meses'
      
      return {
        respuesta: `Para cotizar tu **${config.nombre}**, necesito:\n\n📊 **Monto**: A partir de $${config.montoMinimo.toLocaleString('es-MX')}\n📅 **Plazo**: ${plazosTexto}\n💰 **Enganche** (opcional)\n\nPor ejemplo: *"2 millones a 20 años"* o *"500 mil a 36 meses con 100 mil de enganche"*`,
      }
    }
    
    // Si no detectamos nada
    return {
      respuesta: '¿Qué tipo de crédito te interesa cotizar?\n\n🏠 **Hipotecario** - Para compra de casa\n🚗 **Auto** - Para tu vehículo\n💳 **Personal** - Para lo que necesites',
    }
  }
  
  const handleEnviarMensaje = async (texto: string) => {
    if (!texto.trim()) return
    
    const mensajeUsuario: Mensaje = {
      id: `user_${Date.now()}`,
      tipo: 'usuario',
      texto: texto.trim(),
      timestamp: new Date(),
    }
    setMensajes(prev => [...prev, mensajeUsuario])
    setInputValue('')
    setIsLoading(true)
    
    try {
      // Primero intentar con n8n
      const resultadoN8n = await enviarACotizador(texto, `cotizador_${Date.now()}`)
      
      // Si n8n devuelve una cotización, usarla
      if (resultadoN8n.cotizacion) {
        const mensajeAsistente: Mensaje = {
          id: `assistant_${Date.now()}`,
          tipo: 'asistente',
          texto: resultadoN8n.respuesta,
          cotizacion: resultadoN8n.cotizacion,
          timestamp: new Date(),
        }
        setMensajes(prev => [...prev, mensajeAsistente])
      } else {
        // Si n8n no devuelve cotización, mostrar su respuesta de texto
        const mensajeAsistente: Mensaje = {
          id: `assistant_${Date.now()}`,
          tipo: 'asistente',
          texto: resultadoN8n.respuesta,
          timestamp: new Date(),
        }
        setMensajes(prev => [...prev, mensajeAsistente])
      }
    } catch (error) {
      console.error('Error con n8n, usando cálculo local:', error)
      // Fallback a cálculo local
      const resultado = procesarMensaje(texto)
      const mensajeAsistente: Mensaje = {
        id: `assistant_${Date.now()}`,
        tipo: 'asistente',
        texto: resultado.respuesta,
        cotizacion: resultado.cotizacion,
        timestamp: new Date(),
      }
      setMensajes(prev => [...prev, mensajeAsistente])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleLimpiar = () => setMensajes([])
  const handleNueva = () => setMensajes([])
  
  return (
    <div className={cn(
      "flex flex-col h-full",
      isHey 
        ? "bg-gradient-to-b from-[#1a1f2e] via-[#1f2537] to-[#232a3c]" 
        : "bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30"
    )}>
      {/* Header - igual que el chat principal */}
      <div className={cn(
        "flex items-center justify-between px-5 py-4 border-b shrink-0",
        isHey ? "border-white/10 bg-[#1a1f2e]/80" : "border-orange-100/50 bg-white/80"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "relative p-2.5 rounded-xl",
            isHey 
              ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-500/30" 
              : "bg-gradient-to-br from-orange-100 to-orange-50 ring-1 ring-orange-200"
          )}>
            <Calculator className={cn("w-5 h-5", isHey ? "text-cyan-400" : "text-orange-500")} />
          </div>
          <div>
            <h2 className={cn("font-semibold text-base flex items-center gap-2", isHey ? "text-white" : "text-gray-800")}>
              Cotizador de Créditos
              <span className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                isHey ? "bg-cyan-500/20 text-cyan-400" : "bg-green-100 text-green-600"
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                En línea
              </span>
            </h2>
            <p className={cn("text-xs", isHey ? "text-gray-400" : "text-gray-500")}>
              Simula tu crédito hipotecario, personal o de auto
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleNueva}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              isHey 
                ? "text-gray-300 hover:bg-white/10" 
                : "text-gray-600 hover:bg-orange-50"
            )}
          >
            <PlusCircle className="w-4 h-4" />
            Nueva
          </button>
          <button
            onClick={handleLimpiar}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              isHey 
                ? "text-gray-300 hover:bg-white/10" 
                : "text-gray-600 hover:bg-orange-50"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      </div>
      
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto">
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className={cn(
              "p-4 rounded-2xl mb-6",
              isHey 
                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20" 
                : "bg-gradient-to-br from-orange-100 to-orange-50"
            )}>
              <Sparkles className={cn("w-10 h-10", isHey ? "text-cyan-400" : "text-orange-500")} />
            </div>
            
            <h3 className={cn("text-xl font-bold mb-2 text-center", isHey ? "text-white" : "text-gray-800")}>
              ¡Hola! Soy tu Cotizador
            </h3>
            <p className={cn("text-sm text-center mb-6 max-w-md", isHey ? "text-gray-400" : "text-gray-500")}>
              Dime qué tipo de crédito te interesa y los detalles. Por ejemplo: <br/>
              <span className={cn("italic", isHey ? "text-gray-300" : "text-gray-600")}>
                "Quiero cotizar un crédito hipotecario de 2 millones a 20 años"
              </span>
            </p>
            
            <p className={cn("text-xs mb-3 uppercase tracking-wider", isHey ? "text-gray-500" : "text-gray-400")}>
              Sugerencias para comenzar
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {SUGERENCIAS_INICIO.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleEnviarMensaje(sug.valor)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    isHey
                      ? "bg-white/5 text-gray-300 hover:bg-white/10 border-white/10 hover:border-cyan-500/30"
                      : "bg-white text-gray-700 hover:bg-orange-50 border-orange-200 shadow-sm hover:shadow-md"
                  )}
                >
                  <sug.icon className="w-4 h-4" />
                  {sug.texto}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={cn(
                  "flex",
                  mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  mensaje.tipo === 'usuario'
                    ? isHey
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white'
                    : isHey
                      ? 'bg-white/10 text-gray-100'
                      : 'bg-white border border-orange-100 text-gray-700 shadow-sm'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{mensaje.texto}</p>
                  
                  {mensaje.cotizacion && (
                    <ResultadoCotizacionCard cotizacion={mensaje.cotizacion} />
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={cn(
                  "px-4 py-3 rounded-2xl",
                  isHey ? "bg-white/10" : "bg-white border border-orange-100 shadow-sm"
                )}>
                  <div className="flex gap-1">
                    <div className={cn("w-2 h-2 rounded-full animate-bounce", isHey ? "bg-cyan-400" : "bg-orange-400")} style={{ animationDelay: '0ms' }} />
                    <div className={cn("w-2 h-2 rounded-full animate-bounce", isHey ? "bg-cyan-400" : "bg-orange-400")} style={{ animationDelay: '150ms' }} />
                    <div className={cn("w-2 h-2 rounded-full animate-bounce", isHey ? "bg-cyan-400" : "bg-orange-400")} style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input - igual que el chat principal */}
      <div className={cn(
        "p-4 border-t shrink-0",
        isHey ? "border-white/10 bg-[#1a1f2e]/50" : "border-orange-100 bg-white/80"
      )}>
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleEnviarMensaje(inputValue)
                }
              }}
              placeholder="Escribe tu pregunta..."
              rows={1}
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-xl resize-none text-sm transition-all",
                isHey
                  ? "bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                  : "bg-orange-50/50 border border-orange-200 text-gray-800 placeholder:text-gray-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
              )}
            />
          </div>
          
          <button
            onClick={() => handleEnviarMensaje(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "p-3 rounded-xl transition-all shrink-0",
              inputValue.trim() && !isLoading
                ? isHey
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                : isHey
                  ? "bg-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className={cn(
          "text-center text-xs mt-2",
          isHey ? "text-gray-500" : "text-gray-400"
        )}>
          Presiona <kbd className={cn("px-1.5 py-0.5 rounded text-xs", isHey ? "bg-white/10" : "bg-gray-100")}>Enter</kbd> para enviar
        </p>
      </div>
    </div>
  )
}
