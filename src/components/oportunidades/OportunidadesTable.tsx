/**
 * Tabla de Oportunidades (antes Clientes) sin columnas de IDs/RFC
 */

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye } from 'lucide-react'
import { useUIStore, useClientesStore } from '@/stores'
import { cn } from '@/utils'
import type { FiltrosOportunidades } from './OportunidadesFilters'

// Nombres de promotores ficticios (para simulación)
const PROMOTORES = [
  'Roberto Hernández',
  'María del Carmen López',
  'Alejandro González',
  'Ana Sofía Martínez',
  'Carlos Alberto Ruiz',
  'Lucía Fernández',
  'Jorge Luis Ramírez',
  'Patricia Torres'
]

// Función helper para obtener promotor consistente basado en el nombre del cliente
const getPromotorForCliente = (nombreCliente: string) => {
  let hash = 0
  for (let i = 0; i < nombreCliente.length; i++) {
    hash = nombreCliente.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PROMOTORES[Math.abs(hash) % PROMOTORES.length]!
}

interface OportunidadesTableProps {
  filtros: FiltrosOportunidades
}

export function OportunidadesTable({ filtros }: OportunidadesTableProps) {
  const { theme } = useUIStore()
  const { getClientesFiltrados } = useClientesStore()
  const isHey = theme === 'hey'
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [ordenColumna, setOrdenColumna] = useState<string>('')
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc')
  const itemsPorPagina = 15
  
  // Obtener datos del store y aplicar filtros adicionales si es necesario
  // Nota: El store ya filtra por búsqueda y tipo de persona, pero aquí aseguramos
  const clientes = getClientesFiltrados()
  
  // Agregar campo promotor simulado
  const dataConPromotor = useMemo(() => {
    return clientes.map(c => ({
      ...c,
      promotor: getPromotorForCliente(c.nombreRazonSocial)
    }))
  }, [clientes])

  // Filtrado adicional si fuera necesario (por ejemplo, si agregamos filtro de promotor)
  const datosFiltrados = useMemo(() => {
    return dataConPromotor.filter(item => {
      // Si tuviéramos filtro de promotor:
      if (filtros.promotor && !item.promotor.toLowerCase().includes(filtros.promotor.toLowerCase())) {
        return false
      }
      return true
    })
  }, [dataConPromotor, filtros])
  
  // Ordenar datos
  const datosOrdenados = useMemo(() => {
    if (!ordenColumna) return datosFiltrados
    
    return [...datosFiltrados].sort((a, b) => {
      // @ts-ignore - acceso dinámico a propiedades
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
  
  return (
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
              <ColumnHeader columna="promotor" label="Promotor" />
              <ColumnHeader columna="nombreRazonSocial" label="Nombre / Razón Social" />
              <ColumnHeader columna="tipoPersona" label="Tipo" />
              <ColumnHeader columna="fechaAlta" label="Fecha Alta" />
              <ColumnHeader columna="fechaBaja" label="Fecha Baja" />
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
                key={item.idCliente}
                className={cn(
                  "transition-colors",
                  isHey ? "hover:bg-white/5" : "hover:bg-orange-50/50"
                )}
              >
                <td className={cn("px-3 py-2 text-sm font-medium", isHey ? "text-white" : "text-gray-900")}>
                  {item.promotor}
                </td>
                <td className={cn("px-3 py-2 text-sm", isHey ? "text-gray-300" : "text-gray-700")}>
                  {item.nombreRazonSocial}
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
                <td className={cn("px-3 py-2 text-sm", isHey ? "text-gray-400" : "text-gray-600")}>
                  {item.fechaBaja ? (
                    <span className="text-red-500">{item.fechaBaja}</span>
                  ) : (
                    <span className="opacity-50">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
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
  )
}
