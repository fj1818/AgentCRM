/**
 * Filtros para la sección de Prospectos
 */

import { ChevronDown } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { FiltrosProspectos } from './ProspectosContainer'

// Opciones de filtros
const TIPOS_PERSONA = [
  { value: '', label: 'Todos los tipos' },
  { value: 'Persona Moral', label: 'Persona Moral' },
  { value: 'Persona Fisica con Actividad Empresarial', label: 'Persona Física con Act. Empresarial' },
  { value: 'Persona Fisica', label: 'Persona Física' },
]

const CAMPANAS = [
  { value: '', label: 'Todas las campañas' },
  { value: 'Referencia Propia', label: 'Referencia Propia' },
  { value: 'Pagina Web', label: 'Página Web' },
  { value: 'App', label: 'App' },
  { value: 'Portal', label: 'Portal' },
  { value: 'Campaña Prospectos Perfilados 2026', label: 'Prospectos Perfilados 2026' },
  { value: 'Campaña Navidad 2025', label: 'Navidad 2025' },
  { value: 'Campaña PyMEs Digital', label: 'PyMEs Digital' },
  { value: 'Campaña Empresarios Hey', label: 'Empresarios Hey' },
]

const ETAPAS = [
  { value: '', label: 'Todas las etapas' },
  { value: 'No contactado', label: 'No contactado' },
  { value: 'En negociación', label: 'En negociación' },
  { value: 'Interesado', label: 'Interesado' },
  { value: 'Descartado', label: 'Descartado' },
  { value: 'Convertido', label: 'Convertido' },
]

const FAMILIAS_PRODUCTO = [
  { value: '', label: 'Todas las familias' },
  { value: 'TDC', label: 'TDC' },
  { value: 'TPV', label: 'TPV' },
  { value: 'Cheques', label: 'Cheques' },
]

const PRODUCTOS_POR_FAMILIA: Record<string, { value: string; label: string }[]> = {
  '': [{ value: '', label: 'Todos los productos' }],
  'TDC': [
    { value: '', label: 'Todos los productos TDC' },
    { value: 'TDC Básica', label: 'TDC Básica' },
    { value: 'TDC Oro', label: 'TDC Oro' },
    { value: 'TDC Platinum', label: 'TDC Platinum' },
    { value: 'TDC Empresarial', label: 'TDC Empresarial' },
  ],
  'TPV': [
    { value: '', label: 'Todos los productos TPV' },
    { value: 'TPV Fija', label: 'TPV Fija' },
    { value: 'TPV Móvil', label: 'TPV Móvil' },
    { value: 'TPV E-commerce', label: 'TPV E-commerce' },
  ],
  'Cheques': [
    { value: '', label: 'Todos los productos Cheques' },
    { value: 'Cuenta Cheques Básica', label: 'Cuenta Cheques Básica' },
    { value: 'Cuenta Cheques Empresarial', label: 'Cuenta Cheques Empresarial' },
    { value: 'Cuenta Cheques PyME', label: 'Cuenta Cheques PyME' },
  ],
}

const ORIGENES = [
  { value: '', label: 'Todos los orígenes' },
  { value: 'Referencia Propia', label: 'Referencia Propia' },
  { value: 'Pagina Web', label: 'Página Web' },
  { value: 'App', label: 'App' },
  { value: 'Portal', label: 'Portal' },
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
          value ? (isHey ? "border-cyan-500/50" : "border-orange-400") : ""
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

interface ProspectosFiltersProps {
  filtros: FiltrosProspectos
  onFiltroChange: (campo: keyof FiltrosProspectos, valor: string) => void
}

export function ProspectosFilters({ filtros, onFiltroChange }: ProspectosFiltersProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  // Obtener productos según familia seleccionada
  const productosDisponibles = PRODUCTOS_POR_FAMILIA[filtros.familiaProducto] || PRODUCTOS_POR_FAMILIA[''] || []
  
  // Contar filtros activos
  const filtrosActivos = [
    filtros.tipoPersona,
    filtros.campana,
    filtros.etapa,
    filtros.familiaProducto,
    filtros.producto
  ].filter(Boolean).length
  
  const limpiarFiltros = () => {
    onFiltroChange('tipoPersona', '')
    onFiltroChange('campana', '')
    onFiltroChange('etapa', '')
    onFiltroChange('familiaProducto', '')
    onFiltroChange('producto', '')
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <FilterSelect
          label="Tipo Persona"
          value={filtros.tipoPersona}
          options={TIPOS_PERSONA}
          onChange={(v) => onFiltroChange('tipoPersona', v)}
        />
        
        <FilterSelect
          label="Campaña"
          value={filtros.campana}
          options={CAMPANAS}
          onChange={(v) => onFiltroChange('campana', v)}
        />
        
        <FilterSelect
          label="Etapa"
          value={filtros.etapa}
          options={ETAPAS}
          onChange={(v) => onFiltroChange('etapa', v)}
        />
        
        <FilterSelect
          label="Familia"
          value={filtros.familiaProducto}
          options={FAMILIAS_PRODUCTO}
          onChange={(v) => {
            onFiltroChange('familiaProducto', v)
            onFiltroChange('producto', '') // Reset producto al cambiar familia
          }}
        />
        
        <FilterSelect
          label="Producto"
          value={filtros.producto}
          options={productosDisponibles}
          onChange={(v) => onFiltroChange('producto', v)}
        />
        
        <FilterSelect
          label="Origen"
          value={filtros.campana} // Usando campaña como origen (son similares)
          options={ORIGENES}
          onChange={(v) => onFiltroChange('campana', v)}
        />
      </div>
    </div>
  )
}
