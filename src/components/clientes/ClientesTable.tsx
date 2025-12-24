/**
 * Componente de tabla de clientes
 */

import { useState } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useClientesStore } from '@/stores'
import type { TipoPersona } from '@/types'
import { cn } from '@/utils'

const ITEMS_PER_PAGE = 15

export function ClientesTable() {
  const { filtros, setFiltros, getClientesFiltrados, resetFiltros } = useClientesStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const clientesFiltrados = getClientesFiltrados()
  const totalPages = Math.ceil(clientesFiltrados.length / ITEMS_PER_PAGE)
  
  const clientesPaginados = clientesFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleBusqueda = (busqueda: string) => {
    setFiltros({ busqueda })
    setCurrentPage(1)
  }

  const handleTipoPersona = (tipoPersona: TipoPersona | 'todos') => {
    setFiltros({ tipoPersona })
    setCurrentPage(1)
  }

  const handleSoloActivos = (soloActivos: boolean) => {
    setFiltros({ soloActivos })
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col h-full bg-theme-primary">
      {/* Header */}
      <div className="px-6 py-4 border-b border-theme bg-theme-secondary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Clientes</h1>
            <p className="text-sm text-theme-muted">
              {clientesFiltrados.length} clientes encontrados
            </p>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, RFC, IDE o ID Cliente..."
              value={filtros.busqueda}
              onChange={(e) => handleBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg theme-input"
            />
            {filtros.busqueda && (
              <button
                onClick={() => handleBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors',
              showFilters
                ? 'btn-primary border-transparent'
                : 'border-theme text-theme-secondary hover:bg-theme-elevated'
            )}
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 p-4 rounded-lg bg-theme-elevated border border-theme">
            <div className="flex items-center gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Tipo de Persona
                </label>
                <select
                  value={filtros.tipoPersona}
                  onChange={(e) => handleTipoPersona(e.target.value as TipoPersona | 'todos')}
                  className="px-3 py-2 rounded-lg theme-input"
                >
                  <option value="todos">Todos</option>
                  <option value="Persona Moral">Persona Moral</option>
                  <option value="Persona Fisica con Actividad Empresarial">Persona Física con Actividad Empresarial</option>
                  <option value="Persona Fisica">Persona Física</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="soloActivos"
                  checked={filtros.soloActivos}
                  onChange={(e) => handleSoloActivos(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="soloActivos" className="text-sm text-theme-secondary">
                  Solo clientes activos
                </label>
              </div>
              
              <button
                onClick={() => {
                  resetFiltros()
                  setCurrentPage(1)
                }}
                className="ml-auto text-sm text-theme-accent hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-theme-tertiary sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                IDE
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                RFC
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                Nombre / Razón Social
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                Fecha Alta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                Fecha Baja
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                Tipo Persona
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                ID Prospecto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                ID Cliente
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-light">
            {clientesPaginados.map((cliente) => (
              <tr
                key={cliente.idCliente}
                className="hover:bg-theme-elevated transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-mono text-theme-primary">
                  {cliente.ide}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-theme-primary">
                  {cliente.rfc}
                </td>
                <td className="px-4 py-3 text-sm text-theme-primary max-w-xs truncate" title={cliente.nombreRazonSocial}>
                  {cliente.nombreRazonSocial}
                </td>
                <td className="px-4 py-3 text-sm text-theme-secondary">
                  {cliente.fechaAlta}
                </td>
                <td className="px-4 py-3 text-sm">
                  {cliente.fechaBaja ? (
                    <span className="text-red-500">{cliente.fechaBaja}</span>
                  ) : (
                    <span className="text-theme-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                    cliente.tipoPersona === 'Persona Moral'
                      ? 'bg-blue-500/20 text-blue-400'
                      : cliente.tipoPersona === 'Persona Fisica con Actividad Empresarial'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-green-500/20 text-green-400'
                  )}>
                    {cliente.tipoPersona === 'Persona Fisica con Actividad Empresarial' ? 'PFAE' : 
                     cliente.tipoPersona === 'Persona Moral' ? 'PM' : 'PF'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-theme-tertiary">
                  {cliente.idProspecto}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-theme-tertiary">
                  {cliente.idCliente}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-6 py-4 border-t border-theme bg-theme-secondary flex items-center justify-between">
        <p className="text-sm text-theme-muted">
          Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, clientesFiltrados.length)} de {clientesFiltrados.length}
        </p>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-theme-secondary hover:bg-theme-elevated disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="px-4 py-2 text-sm text-theme-secondary">
            Página {currentPage} de {totalPages || 1}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg text-theme-secondary hover:bg-theme-elevated disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
