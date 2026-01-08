/**
 * Tabla de Oportunidades (antes Clientes) sin columnas de IDs/RFC
 */

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye } from 'lucide-react'
import { useUIStore, useClientesStore } from '@/stores'
import { cn } from '@/utils'
import type { FiltrosOportunidades } from './OportunidadesFilters'
import { ofertasClientesData } from '@/data/ofertasClientesData'
import { DetalleOfertaModal } from './DetalleOfertaModal'


// Formateador de moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

interface OportunidadesTableProps {
  filtros: FiltrosOportunidades
}

export function OportunidadesTable({ filtros }: OportunidadesTableProps) {
  const { theme } = useUIStore()
  const { clientes } = useClientesStore() // Obtener lista completa de clientes para lookup
  const isHey = theme === 'hey'
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [ordenColumna, setOrdenColumna] = useState<string>('')
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc')
  const itemsPorPagina = 15
  
  // JOIN: Ofertas + Datos Cliente
  const dataCompleta = useMemo(() => {
    // Crear mapa de clientes para acceso rápido
    const clientesMap = new Map(clientes.map(c => [c.ide, c]))

    return ofertasClientesData.map(oferta => {
      const cliente = clientesMap.get(oferta.ide)
      
      return {
        ...oferta,
        // Datos enriquecidos del cliente
        nombreRazonSocial: cliente?.nombreRazonSocial || 'Cliente Desconocido',
        tipoPersona: cliente?.tipoPersona || 'Persona Fisica',
        // Datos transformados/mapeados
        promotorNombre: oferta.promotorNombre,
        familia: oferta.familiaProducto,
        producto: oferta.productoInteres
      }
    })
  }, [clientes]) // Se recalcula si cambian clientes

  // Filtrado
  const datosFiltrados = useMemo(() => {
    return dataCompleta.filter(item => {
      // Búsqueda general (Nombre Cliente (oculto pero buscable?), Promotor, Producto)
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase()
        const matches = 
          item.nombreRazonSocial.toLowerCase().includes(q) ||
          item.promotorNombre.toLowerCase().includes(q) ||
          item.producto.toLowerCase().includes(q)
        if (!matches) return false
      }

      // Filtros específicos
      if (filtros.promotor && !item.promotorNombre.toLowerCase().includes(filtros.promotor.toLowerCase())) return false
      if (filtros.familiaProducto && item.familia !== filtros.familiaProducto) return false
      if (filtros.producto && item.producto !== filtros.producto) return false
      if (filtros.tipoPersona !== 'todos' && item.tipoPersona !== filtros.tipoPersona) return false
      
      return true
    })
  }, [dataCompleta, filtros])
  
  // Ordenar datos
  const datosOrdenados = useMemo(() => {
    if (!ordenColumna) return datosFiltrados
    
    return [...datosFiltrados].sort((a, b) => {
      // @ts-ignore - acceso dinámico
      const aVal = a[ordenColumna]
      // @ts-ignore
      const bVal = b[ordenColumna]
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return ordenDireccion === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal || '').toLowerCase()
      const bStr = String(bVal || '').toLowerCase()
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
  
  // Reset página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [filtros])

  const handleOrden = (columna: string) => {
    if (ordenColumna === columna) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenColumna(columna)
      setOrdenDireccion('asc')
    }
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
  
  // State para el modal
  const [modalOpen, setModalOpen] = useState(false)
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<any>(null)

  const handleVerDetalle = (oferta: any) => {
    setOfertaSeleccionada(oferta)
    setModalOpen(true)
  }

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
            Mostrando <strong>{datosPaginados.length}</strong> de <strong>{datosOrdenados.length}</strong> oportunidades
          </span>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn(
              isHey ? "bg-white/5" : "bg-orange-50"
            )}>
              <tr>
                <ColumnHeader columna="numeroPromotor" label="No. Promotor" />
                <ColumnHeader columna="promotor" label="Promotor" />
                {/* <ColumnHeader columna="nombreRazonSocial" label="Nombre / Razón Social" /> - Eliminado por petición */}
                <ColumnHeader columna="familia" label="Familia" />

                <ColumnHeader columna="montoOferta" label="Monto Oferta" />
                <ColumnHeader columna="tipoPersona" label="Tipo" />
                <ColumnHeader columna="fechaAlta" label="Fecha Alta" />

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
              {datosPaginados.map((item) => (
                <tr 
                  key={item.idOferta}
                  className={cn(
                    "transition-colors",
                    isHey ? "hover:bg-white/5" : "hover:bg-orange-50/50"
                  )}
                >
                  <td className={cn("px-3 py-2 text-sm", isHey ? "text-gray-400" : "text-gray-600")}>
                    {item.numeroPromotor}
                  </td>
                  <td className={cn("px-3 py-2 text-sm font-medium", isHey ? "text-white" : "text-gray-900")}>
                    {item.promotorNombre}
                  </td>
                  <td className={cn("px-3 py-2 text-sm", isHey ? "text-cyan-400" : "text-orange-600")}>
                    {item.familia}
                  </td>

                  <td className={cn("px-3 py-2 text-sm font-medium", isHey ? "text-emerald-400" : "text-emerald-600")}>
                    {formatCurrency(item.montoOferta)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      item.tipoPersona === 'Persona Moral'
                        ? 'bg-blue-500/20 text-blue-400'
                        : item.tipoPersona === 'Persona Fisica con Actividad Empresarial'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-green-500/20 text-green-400'
                    )}>
                      {item.tipoPersona === 'Persona Fisica con Actividad Empresarial' ? 'PFAE' : 
                       item.tipoPersona === 'Persona Moral' ? 'PM' : 'PF'}
                    </span>
                  </td>
                  <td className={cn("px-3 py-2 text-sm", isHey ? "text-gray-400" : "text-gray-600")}>
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
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination - Keep existing logic... will be rendered below */}

      
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
            // Lógica de paginación simple...
            if (totalPaginas <= 5) pageNum = i + 1
            else if (paginaActual <= 3) pageNum = i + 1
            else if (paginaActual >= totalPaginas - 2) pageNum = totalPaginas - 4 + i
            else pageNum = paginaActual - 2 + i

            if (pageNum <= 0 || pageNum > totalPaginas) return null
            
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

      {modalOpen && ofertaSeleccionada && (
        <DetalleOfertaModal 
          oferta={ofertaSeleccionada} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </>
  )
}
