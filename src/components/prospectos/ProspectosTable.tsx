/**
 * Tabla de Prospectos con datos de ofertas
 */

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { FiltrosProspectos } from './ProspectosContainer'
import { DetalleProspectoModal } from './DetalleProspectoModal'

// Colores por etapa
const ETAPA_COLORS: Record<string, { bg: string; text: string; bgHey: string; textHey: string }> = {
  'No contactado': { bg: 'bg-gray-100', text: 'text-gray-700', bgHey: 'bg-gray-500/20', textHey: 'text-gray-300' },
  'En negociación': { bg: 'bg-blue-100', text: 'text-blue-700', bgHey: 'bg-blue-500/20', textHey: 'text-blue-300' },
  'Interesado': { bg: 'bg-yellow-100', text: 'text-yellow-700', bgHey: 'bg-yellow-500/20', textHey: 'text-yellow-300' },
  'Descartado': { bg: 'bg-red-100', text: 'text-red-700', bgHey: 'bg-red-500/20', textHey: 'text-red-300' },
  'Convertido': { bg: 'bg-green-100', text: 'text-green-700', bgHey: 'bg-green-500/20', textHey: 'text-green-300' },
}

import { ProspectoOferta } from '@/data/prospectosData'

interface ProspectosTableProps {
  filtros: FiltrosProspectos
  data: ProspectoOferta[]
  onUpdateProspecto: (nombreOrRfc: string, campo: string, valor: any) => boolean
}

export function ProspectosTable({ filtros, data, onUpdateProspecto }: ProspectosTableProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [ordenColumna, setOrdenColumna] = useState<string>('')
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [prospectoSeleccionado, setProspectoSeleccionado] = useState<ProspectoOferta | null>(null)
  
  const itemsPorPagina = 15
  
  const handleVerDetalle = (prospecto: ProspectoOferta) => {
    setProspectoSeleccionado(prospecto)
    setModalOpen(true)
  }
  
  // Filtrar datos
  const datosFiltrados = useMemo(() => {
    return data.filter(item => {
      if (filtros.tipoPersona && item.tipoPersona !== filtros.tipoPersona) return false
      if (filtros.campana && item.campaña !== filtros.campana) return false
      if (filtros.etapa && item.etapa !== filtros.etapa) return false
      if (filtros.familiaProducto && item.familiaProducto !== filtros.familiaProducto) return false
      if (filtros.producto && item.productoInteres !== filtros.producto) return false
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        return (
          (item.nombreProspecto && item.nombreProspecto.toLowerCase().includes(busqueda)) ||
          item.rfc.toLowerCase().includes(busqueda) ||
          item.productoInteres.toLowerCase().includes(busqueda) ||
          item.idProspecto.toLowerCase().includes(busqueda) ||
          item.nombrePromotor.toLowerCase().includes(busqueda)
        )
      }
      return true
    })
  }, [filtros, data])
  
  // Ordenar datos
  const datosOrdenados = useMemo(() => {
    if (!ordenColumna) return datosFiltrados
    
    return [...datosFiltrados].sort((a, b) => {
      const aVal = a[ordenColumna as keyof ProspectoOferta]
      const bVal = b[ordenColumna as keyof ProspectoOferta]
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return ordenDireccion === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return ordenDireccion === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr)
    })
  }, [datosFiltrados, ordenColumna, ordenDireccion])
  
  // Paginar
  const totalPaginas = Math.ceil(datosOrdenados.length / itemsPorPagina)
  const datosPaginados = datosOrdenados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  )
  
  // Reset página al cambiar filtros o data
  useEffect(() => {
    setPaginaActual(1)
  }, [filtros, data])
  
  const handleOrden = (columna: string) => {
    if (ordenColumna === columna) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenColumna(columna)
      setOrdenDireccion('asc')
    }
  }
  
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto)
  }
  
  // Column header component
  const ColumnHeader = ({ columna, label }: { columna: string; label: string }) => (
    <th 
      className={cn(
        "px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity",
        isHey ? "text-gray-400" : "text-gray-500"
      )}
      onClick={() => handleOrden(columna)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn(
          "w-3 h-3",
          ordenColumna === columna ? (isHey ? "text-cyan-400" : "text-orange-500") : "opacity-30"
        )} />
      </div>
    </th>
  )
  
  return (
    <>
      <div className={cn(
        "rounded-xl border overflow-hidden",
        isHey ? "border-white/10 bg-white/5" : "border-orange-200 bg-white"
      )}>
        {/* Stats bar */}
        <div className={cn(
          "px-4 py-2 flex items-center justify-between text-sm",
          isHey ? "bg-white/5 border-b border-white/10" : "bg-orange-50 border-b border-orange-100"
        )}>
          <span className={isHey ? "text-gray-400" : "text-gray-600"}>
            Mostrando <strong>{datosPaginados.length}</strong> de <strong>{datosOrdenados.length}</strong> prospectos
          </span>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn(
              isHey ? "bg-white/5" : "bg-orange-50"
            )}>
              <tr>
                <ColumnHeader columna="nombrePromotor" label="Promotor" />
                <ColumnHeader columna="familiaProducto" label="Familia" />
                <ColumnHeader columna="etapa" label="Etapa" />
                <ColumnHeader columna="campaña" label="Campaña" />
                <ColumnHeader columna="montoInteres" label="Monto" />
                <ColumnHeader columna="fechaAlta" label="Fecha" />
                <th className={cn(
                  "px-3 py-3 text-center text-xs font-medium uppercase tracking-wider",
                  isHey ? "text-gray-400" : "text-gray-500"
                )}>
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y",
              isHey ? "divide-white/5" : "divide-orange-100"
            )}>
              {datosPaginados.map((item) => {
                const etapaColor = ETAPA_COLORS[item.etapa] || ETAPA_COLORS['No contactado']!
                
                return (
                  <tr 
                    key={item.idOferta}
                    className={cn(
                      "transition-colors",
                      isHey ? "hover:bg-white/5" : "hover:bg-orange-50/50"
                    )}
                  >
                    <td className={cn("px-3 py-2 text-sm font-medium", isHey ? "text-gray-300" : "text-gray-700")}>
                      {item.nombrePromotor}
                    </td>
                    <td className={cn("px-3 py-2 text-sm font-medium", 
                      isHey ? "text-cyan-400" : "text-orange-600"
                    )}>
                      {item.familiaProducto}
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        isHey ? etapaColor.bgHey : etapaColor.bg,
                        isHey ? etapaColor.textHey : etapaColor.text
                      )}>
                        {item.etapa}
                      </span>
                    </td>
                    <td className={cn("px-3 py-2 text-sm", isHey ? "text-gray-400" : "text-gray-600")}>
                      {item.campaña.length > 20 ? item.campaña.substring(0, 20) + '...' : item.campaña}
                    </td>
                    <td className={cn("px-3 py-2 text-sm font-medium text-right", isHey ? "text-green-400" : "text-green-600")}>
                      {formatMonto(item.montoInteres)}
                    </td>
                    <td className={cn("px-3 py-2 text-sm", isHey ? "text-gray-400" : "text-gray-500")}>
                      {item.fechaAlta}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleVerDetalle(item)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          isHey ? "hover:bg-white/10 text-cyan-400" : "hover:bg-orange-100 text-orange-500"
                        )}
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className={cn(
          "px-4 py-3 flex items-center justify-between border-t",
          isHey ? "border-white/10" : "border-orange-100"
        )}>
          <button
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
              paginaActual === 1
                ? isHey ? "text-gray-600 cursor-not-allowed" : "text-gray-400 cursor-not-allowed"
                : isHey ? "text-cyan-400 hover:bg-white/10" : "text-orange-500 hover:bg-orange-100"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              let pageNum: number
              if (totalPaginas <= 5) {
                pageNum = i + 1
              } else if (paginaActual <= 3) {
                pageNum = i + 1
              } else if (paginaActual >= totalPaginas - 2) {
                pageNum = totalPaginas - 4 + i
              } else {
                pageNum = paginaActual - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPaginaActual(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                    paginaActual === pageNum
                      ? isHey ? "bg-cyan-500 text-white" : "bg-orange-500 text-white"
                      : isHey ? "text-gray-400 hover:bg-white/10" : "text-gray-600 hover:bg-orange-100"
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
              paginaActual === totalPaginas
                ? isHey ? "text-gray-600 cursor-not-allowed" : "text-gray-400 cursor-not-allowed"
                : isHey ? "text-cyan-400 hover:bg-white/10" : "text-orange-500 hover:bg-orange-100"
            )}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {modalOpen && prospectoSeleccionado && (
        <DetalleProspectoModal 
          prospecto={prospectoSeleccionado} 
          onClose={() => setModalOpen(false)}
          onUpdateProspecto={onUpdateProspecto} 
        />
      )}
    </>
  )
}
