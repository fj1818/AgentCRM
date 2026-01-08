/**
 * Filtros para la sección de Oportunidades (antes Clientes)
 */

import { ChevronDown } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { TipoPersona } from '@/types'

export interface FiltrosOportunidades {
  busqueda: string
  tipoPersona: TipoPersona | 'todos'
  soloActivos: boolean
  promotor?: string
}

const TIPOS_PERSONA = [
  { value: 'todos', label: 'Todos los tipos' },
  { value: 'Persona Moral', label: 'Persona Moral' },
  { value: 'Persona Fisica con Actividad Empresarial', label: 'Persona Física con Act. Empresarial' },
  { value: 'Persona Fisica', label: 'Persona Física' },
]

interface FilterSelectProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none w-full px-3 py-2 pr-8 rounded-lg border text-sm cursor-pointer",
          isHey 
            ? "bg-white/5 border-white/10 text-white" 
            : "bg-white border-orange-200 text-gray-700",
          value && value !== 'todos' ? (isHey ? "border-cyan-500/50" : "border-orange-400") : ""
        )}
      >
        {options.map(opt => (
          <option 
            key={opt.value} 
            value={opt.value}
            className={isHey ? "bg-[#1a1f2e] text-white" : ""}
          >
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
        isHey ? "text-gray-400" : "text-gray-500"
      )} />
      <span className={cn(
        "absolute -top-2 left-2 px-1 text-xs",
        isHey ? "bg-[#1a1f2e] text-gray-400" : "bg-white text-gray-500"
      )}>
        {label}
      </span>
    </div>
  )
}

interface OportunidadesFiltersProps {
  filtros: FiltrosOportunidades
  onFiltroChange: (filtros: Partial<FiltrosOportunidades>) => void
}

export function OportunidadesFilters({ filtros, onFiltroChange }: OportunidadesFiltersProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  // Contar filtros activos (excluyendo búsqueda y valores por defecto)
  const filtrosActivos = [
    filtros.tipoPersona !== 'todos',
    filtros.soloActivos === true,
    filtros.promotor
  ].filter(Boolean).length
  
  const limpiarFiltros = () => {
    onFiltroChange({
      tipoPersona: 'todos',
      soloActivos: false,
      promotor: ''
    })
  }
  
  return (
    <div className={cn(
      "p-4 rounded-xl border",
      isHey ? "border-white/10 bg-white/5" : "border-orange-200 bg-white"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium", isHey ? "text-white" : "text-gray-700")}>
            Filtros
          </span>
          {filtrosActivos > 0 && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              isHey ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-100 text-orange-600"
            )}>
              {filtrosActivos} activo{filtrosActivos > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {filtrosActivos > 0 && (
          <button
            onClick={limpiarFiltros}
            className={cn(
              "text-xs hover:underline",
              isHey ? "text-cyan-400" : "text-orange-500"
            )}
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      {/* Filter grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterSelect
          label="Tipo Persona"
          value={filtros.tipoPersona}
          options={TIPOS_PERSONA}
          onChange={(v) => onFiltroChange({ tipoPersona: v as TipoPersona | 'todos' })}
        />
        
        {/* Toggle para solo activos */}
        <div className={cn(
          "flex items-center px-3 py-2 rounded-lg border",
          isHey ? "border-white/10 bg-white/5" : "border-orange-200 bg-white"
        )}>
          <input
            type="checkbox"
            id="soloActivos"
            checked={filtros.soloActivos}
            onChange={(e) => onFiltroChange({ soloActivos: e.target.checked })}
            className={cn(
              "w-4 h-4 rounded border-gray-300",
              isHey ? "bg-white/10 border-white/20 accent-cyan-500" : "accent-orange-500"
            )}
          />
          <label 
            htmlFor="soloActivos" 
            className={cn(
              "ml-2 text-sm cursor-pointer select-none",
              isHey ? "text-gray-300" : "text-gray-700"
            )}
          >
            Solo clientes activos (con fecha de alta)
          </label>
        </div>
      </div>
    </div>
  )
}
