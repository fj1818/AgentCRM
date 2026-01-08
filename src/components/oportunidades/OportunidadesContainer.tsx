/**
 * Oportunidades Container (antes Clientes)
 * Layout dividido: Filtros y Tabla (Izq) + Chat Agente (Der)
 */

import { useState } from 'react'
import { Users } from 'lucide-react'
import { useUIStore, useClientesStore } from '@/stores'
import { cn } from '@/utils'
import { OportunidadesFilters, type FiltrosOportunidades } from './OportunidadesFilters'
import { OportunidadesTable } from './OportunidadesTable'
import { OportunidadesChatSidebar } from './OportunidadesChatSidebar'

export function OportunidadesContainer() {
  const { theme } = useUIStore()
  const { filtros: storeFiltros, setFiltros: setStoreFiltros } = useClientesStore()
  const isHey = theme === 'hey'
  
  // Estado local para filtros adicionales o UI
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosOportunidades>({
    busqueda: storeFiltros.busqueda,
    tipoPersona: storeFiltros.tipoPersona,
    soloActivos: storeFiltros.soloActivos,
    promotor: ''
  })
  
  // Sincronizar cambios de filtros locales con el store de clientes
  const handleFiltroChange = (nuevosFiltros: Partial<FiltrosOportunidades>) => {
    const actualizados = { ...filtrosLocales, ...nuevosFiltros }
    setFiltrosLocales(actualizados)
    
    // Actualizar store global para que useClientesStore filtre la data
    setStoreFiltros({
      busqueda: actualizados.busqueda,
      tipoPersona: actualizados.tipoPersona,
      soloActivos: actualizados.soloActivos
    })
  }
  
  return (
    <div className={cn(
      "flex h-full overflow-hidden transition-colors duration-300",
      isHey ? "bg-[#0f1219]" : "bg-gray-50"
    )}>
      {/* Panel Izquierdo: Tubería de Oportunidades */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className={cn(
          "px-6 py-5 border-b shrink-0",
          isHey ? "border-white/10 bg-[#1a1f2e]" : "border-orange-100 bg-white"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "p-2 rounded-lg",
              isHey ? "bg-cyan-500/10 text-cyan-400" : "bg-orange-100 text-orange-600"
            )}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className={cn("text-2xl font-bold", isHey ? "text-white" : "text-gray-900")}>
                Cartera de Oportunidades
              </h1>
              <p className={cn("text-sm", isHey ? "text-gray-400" : "text-gray-500")}>
                Gestiona y analiza tus clientes activos y potenciales
              </p>
            </div>
          </div>
        </div>
        
        {/* Contenido Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Barra de Búsqueda Principal */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, promotor..."
              value={filtrosLocales.busqueda}
              onChange={(e) => handleFiltroChange({ busqueda: e.target.value })}
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-lg transition-all shadow-sm focus:ring-2 search-cancel:text-gray-400",
                isHey 
                  ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500/50" 
                  : "bg-white border-orange-100 text-gray-900 placeholder-gray-400 focus:ring-orange-500/20 focus:border-orange-400"
              )}
            />
          </div>

          <OportunidadesFilters 
            filtros={filtrosLocales} 
            onFiltroChange={handleFiltroChange} 
          />
          
          <OportunidadesTable filtros={filtrosLocales} />
        </div>
      </div>
      
      {/* Panel Derecho: Chat Agente (Ancho Fijo) */}
      <div className="w-[450px] shrink-0 h-full border-l border-white/10">
        <OportunidadesChatSidebar />
      </div>
    </div>
  )
}
