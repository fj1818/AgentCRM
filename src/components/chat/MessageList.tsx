import { type RefObject, useState } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { WelcomeMessage } from './WelcomeMessage'
import { DynamicChart } from '@/components/charts'
import { OfferDetailModal } from './OfferDetailModal'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { Eye } from 'lucide-react'

// ... (Interfaces GraficoData, TablaData, ResultadoHistorico remain same)
interface GraficoData {
  tipo: 'pie' | 'bar' | 'line' | 'column' | 'polar'
  titulo: string
  datos: { x: string; value: number }[]
}

interface TablaData {
  columnas: string[]
  filas: Record<string, unknown>[]
  titulo?: string
  paginate?: boolean
  pageSize?: number
}

interface ResultadoHistorico {
  id: string
  tipo: 'tabla' | 'grafico'
  tabla?: TablaData
  grafico?: GraficoData
}

interface MessageListProps {
  messages: ChatMessageType[]
  isLoading: boolean
  messagesEndRef: RefObject<HTMLDivElement>
  ultimoGrafico?: GraficoData | null
  ultimaTabla?: TablaData | null
  historialResultados?: ResultadoHistorico[]
  onSendMessage?: (message: string) => void
}

/** Traduce nombres de columnas técnicos a español legible */
function traducirColumna(columna: string): string {
  const traducciones: Record<string, string> = {
    'tipoPersona': 'Tipo de Persona',
    'producto': 'Tipo de Tarjeta',
    'estado': 'Estado',
    'municipio': 'Municipio',
    'value': 'Cantidad de TDC',
    'cantidad': 'Total',
    'nombre': 'Nombre',
    'rfc': 'RFC',
    'fechaAlta': 'Fecha de Alta',
    'fechaBaja': 'Fecha de Baja',
    'ide': 'ID',
    'idOferta': 'ID Oferta',
    'idProspecto': 'ID Prospecto',
    'numeroPromotor': 'Promotor',
    'numeroLinea': 'Número de Línea',
    'lineaTotal': 'Línea Total',
    'lineaDisponible': 'Línea Disponible',
    'lineaUso': 'Línea en Uso',
    'telefono': 'Teléfono',
    'correo': 'Correo Electrónico',
    'calle': 'Calle',
    'numero': 'Número',
    'cp': 'Código Postal',
    'colonia': 'Colonia',
    'familiaProducto': 'Familia',
    'productoInteres': 'Producto',
    'montoInteres': 'Monto',
    'montoOferta': 'Monto',
    'etapa': 'Etapa'
  }
  
  if (traducciones[columna]) {
    return traducciones[columna]
  }
  
  const sinPrefijo = columna.split('_').pop() || columna
  if (traducciones[sinPrefijo]) {
    return traducciones[sinPrefijo]
  }
  
  return columna.charAt(0).toUpperCase() + columna.slice(1).replace(/_/g, ' ')
}

/** Formatea valores para mostrar */
function formatearValor(valor: unknown, columna: string): string {
  if (valor === null || valor === undefined) return '-'
  
  const colLower = columna.toLowerCase()
  
  // Formatear IDE/ide con 8 dígitos (padding con ceros)
  if (colLower === 'ide' || colLower === 'id') {
    const numStr = String(valor)
    return numStr.padStart(8, '0')
  }
  
  if (typeof valor === 'number') {
    // Columnas que son montos de dinero
    const esMoneda = 
      colLower.includes('linea') || 
      colLower.includes('monto') || 
      colLower.includes('saldo') || 
      colLower.includes('facturacion') || 
      colLower.includes('total') ||
      colLower.includes('uso') ||
      colLower.includes('disponible') ||
      colLower.includes('ingreso') ||
      colLower.includes('egreso')
    
    if (esMoneda) {
      return `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return valor.toLocaleString('es-MX')
  }
  
  return String(valor)
}

/** Componente para renderizar tablas de resultados */
function ResultTable({ tabla }: { tabla: TablaData }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  if (!tabla.filas.length) return null
  
  // Paginación
  const shouldPaginate = tabla.paginate ?? false
  const pageSize = tabla.pageSize ?? 20
  const totalPages = Math.ceil(tabla.filas.length / pageSize)
  
  // Obtener filas de la página actual
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = startIdx + pageSize
  const filasActuales = shouldPaginate ? tabla.filas.slice(startIdx, endIdx) : tabla.filas

  const todasLasColumnas = tabla.columnas.length > 0 
    ? tabla.columnas 
    : [...new Set(tabla.filas.flatMap(fila => Object.keys(fila)))]
  
  // Columnas ocultas generales
  const columnasOcultas = ['items', 'clientes', 'tdc', 'telefonos', 'correos', 'direcciones', 'descripcionOferta']
  
  // Detectar idOferta de forma insensible a mayúsculas/minúsculas
  const colIdOferta = todasLasColumnas.find(col => 
    col.toLowerCase() === 'idoferta' || col.toLowerCase() === 'id_oferta'
  )
  const esTablaOfertas = !!colIdOferta

  const columnasFiltradas = todasLasColumnas.filter(col => 
    !columnasOcultas.includes(col) && 
    !col.includes('_ide') &&
    col !== colIdOferta // Ocultar idOferta de la vista principal
  )

  return (
    <>
      <div className="max-w-4xl mx-auto overflow-x-auto animate-fade-in my-4">
        <div 
          className={cn(
            "rounded-2xl shadow-xl overflow-hidden border",
            isHey 
              ? "bg-white/5 border-white/10 backdrop-blur-xl" 
              : "bg-white border-orange-100"
          )}
        >
          {tabla.titulo && (
            <div 
              className={cn(
                "px-5 py-4 font-semibold",
                isHey 
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white border-b border-white/10" 
                  : "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 border-b border-orange-100"
              )}
            >
              {tabla.titulo}
            </div>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr 
                className={cn(
                  isHey 
                    ? "bg-white/5" 
                    : "bg-orange-50"
                )}
              >
                {columnasFiltradas.map((col, i) => (
                  <th 
                    key={i} 
                    className={cn(
                      "px-5 py-4 text-left font-semibold text-xs uppercase tracking-wider",
                      isHey ? "text-cyan-300" : "text-orange-600"
                    )}
                  >
                    {traducirColumna(col)}
                  </th>
                ))}
                {esTablaOfertas && (
                  <th className={cn(
                    "px-5 py-4 text-center font-semibold text-xs uppercase tracking-wider",
                    isHey ? "text-cyan-300" : "text-orange-600"
                  )}>
                    Detalle
                  </th>
                )}
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y",
              isHey ? "divide-white/10" : "divide-orange-100"
            )}>
              {filasActuales.map((fila, rowIdx) => (
                <tr 
                  key={rowIdx}
                  className={cn(
                    "transition-colors",
                    isHey 
                      ? "hover:bg-white/5" 
                      : "hover:bg-orange-50/50"
                  )}
                >
                  {columnasFiltradas.map((col, colIdx) => (
                    <td 
                      key={colIdx}
                      className={cn(
                        "px-5 py-4",
                        isHey ? "text-white/80" : "text-gray-700"
                      )}
                    >
                      {formatearValor(fila[col], col)}
                    </td>
                  ))}
                  {esTablaOfertas && (
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedRow(fila)}
                        className={cn(
                          "p-2 rounded-lg transition-all shadow-md active:scale-95",
                          isHey 
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500" 
                            : "bg-gradient-to-r from-orange-400 to-amber-400 text-white hover:from-orange-300 hover:to-amber-300"
                        )}
                        title="Ver detalle completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div 
            className={cn(
              "px-5 py-3 text-xs font-medium flex items-center justify-between",
              isHey 
                ? "bg-white/5 text-white/50 border-t border-white/10" 
                : "bg-orange-50/50 text-gray-500 border-t border-orange-100"
            )}
          >
            <span>
              {tabla.filas.length} resultado{tabla.filas.length !== 1 ? 's' : ''}
              {shouldPaginate && ` (Mostrando ${startIdx + 1}-${Math.min(endIdx, tabla.filas.length)})`}
            </span>
            
            {shouldPaginate && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : isHey
                        ? "bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30"
                        : "bg-orange-200 text-orange-700 hover:bg-orange-300"
                  )}
                >
                  Anterior
                </button>
                
                <span className={cn(
                  "text-xs font-semibold px-2",
                  isHey ? "text-white" : "text-gray-700"
                )}>
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : isHey
                        ? "bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30"
                        : "bg-orange-200 text-orange-700 hover:bg-orange-300"
                  )}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OfferDetailModal
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        data={selectedRow}
      />
    </>
  )
}

export function MessageList({
  messages,
  isLoading,
  messagesEndRef,
  onSendMessage,
}: MessageListProps) {
  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
      {isEmpty ? (
        <WelcomeMessage onSend={onSendMessage} />
      ) : (
        <>
          {messages.map((message) => {
            // @ts-expect-error - Datos extendidos del mensaje
            const grafico = message.grafico as GraficoData | null
            // @ts-expect-error - Datos extendidos del mensaje
            const tabla = message.tabla as TablaData | null

            return (
              <div key={message.id}>
                <ChatMessage message={message} />
                
                {message.role === 'assistant' && tabla && tabla.filas?.length > 0 && (
                  <ResultTable tabla={tabla} />
                )}
                
                {message.role === 'assistant' && grafico && grafico.datos?.length > 0 && (
                  <div className="max-w-2xl mx-auto animate-fade-in my-4">
                    <DynamicChart
                      tipo={grafico.tipo}
                      titulo={grafico.titulo}
                      datos={grafico.datos}
                      height={350}
                    />
                  </div>
                )}
              </div>
            )
          })}
          
          {isLoading && <TypingIndicator />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
