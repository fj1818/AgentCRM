import { useState } from 'react'
import { Search, ChevronRight, MessageSquare, PieChart, TrendingUp, Users, Package, MapPin, AlertTriangle, BarChart3, Briefcase } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

interface PromptLibraryProps {
  onSelectPrompt: (prompt: string) => void
}

interface PromptCategory {
  id: string
  title: string
  icon: React.ElementType
  prompts: {
    id: string
    label: string
    query: string
  }[]
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'analisis',
    title: 'Análisis y Métricas',
    icon: PieChart,
    prompts: [
      {
        id: 'distribucion_tipo',
        label: 'Distribución de Clientes por Tipo',
        query: 'Muestra la distribución de clientes por tipo de persona'
      },
      {
        id: 'top_clientes_valor',
        label: 'Top 10 Clientes por Valor',
        query: 'Muéstrame los 10 clientes con mayor valor total de productos'
      },
      {
        id: 'clientes_estado',
        label: 'Clientes Activos vs Inactivos',
        query: 'Muestra cuántos clientes activos e inactivos tengo'
      },
      {
        id: 'variaciones',
        label: 'Variaciones Relevantes del Mes',
        query: 'Muestrame las 15 variaciones más grandes del último mes (ingresos y egresos) ordenadas por magnitud'
      },
      {
        id: 'cumplimiento_objetivos',
        label: 'Cumplimiento de Objetivos',
        query: 'Genera un tablero de metas SIN consultar la base de datos. Crea una tabla con estos indicadores: Captación, Colocación, Facturación TPV, Seguros, Créditos. Columnas: Meta Mensual, Avance Actual, % Cumplimiento, Delta. Usa valores de ejemplo donde el Avance sea entre 50% y 120% de la Meta. En la columna Delta agrega un indicador: si el avance supera la meta usa \"🟢 ↑\" y si falta para llegar usa \"🔴 ↓\". Delta = Avance - Meta.'
      },
      {
        id: 'portafolio_clientes',
        label: 'Tenencia de Productos por Cliente',
        query: 'Muestra una tabla con cada cliente (IDE, Nombre) y si tiene o no cada producto (TDC, Cheques, Nóminas, Créditos, TPV, Seguros). Usa "Sí" o "No" para indicar si tiene el producto'
      },

      {
        id: 'estrategia_ventas',
        label: 'Estrategia de Ventas',
        query: 'Redacta una estrategia de ventas completa y bien estructurada (NO tabla). Incluye: 1) Estrategia de Venta Cruzada: cómo ofrecer productos complementarios a clientes actuales. 2) Colocación de Créditos: tácticas para incrementar la colocación. 3) Incremento de Facturación: acciones para aumentar montos TPV. Para cada estrategia incluye: objetivo, público meta, acciones específicas, métricas de éxito y plazos estimados. Usa números de ejemplo realistas.'
      }
    ]
  },
  {
    id: 'productos',
    title: 'Análisis de Productos',
    icon: Package,
    prompts: [
      {
        id: 'distribucion_tdc',
        label: 'Distribución de TDC por Tipo',
        query: 'Muestra la distribución de tarjetas de crédito por tipo de producto'
      },
      {
        id: 'utilizacion_lineas',
        label: 'Utilización de Líneas de Crédito',
        query: 'Muestra los 20 clientes con mayor porcentaje de utilización de su línea de crédito'
      },
      {
        id: 'productos_cliente',
        label: 'Productos por Cliente',
        query: 'Muestra cuántos productos tiene cada cliente (TDC, Cheques, TPV)'
      },
      {
        id: 'distribucion_productos',
        label: 'Distribución de Clientes y Productos',
        query: 'Muestra mi distribución de tipo de clientes y productos'
      }
    ]
  },
  {
    id: 'financiero',
    title: 'Análisis Financiero',
    icon: TrendingUp,
    prompts: [
      {
        id: 'top_facturacion',
        label: 'Mayor Facturación TPV',
        query: 'Muestra los 10 clientes con mayor facturación en TPV'
      },
      {
        id: 'flujo_mensual',
        label: 'Flujo de Efectivo Mensual',
        query: 'Muestra el flujo de efectivo mensual de los últimos 12 meses'
      },
      {
        id: 'concentracion_riesgo',
        label: 'Concentración de Riesgo',
        query: 'Muestra el análisis de concentración de riesgo (top 20 clientes por valor)'
      }
    ]
  },
  {
    id: 'comercial',
    title: 'Gestión Comercial',
    icon: Briefcase,
    prompts: [
      {
        id: 'oportunidades',
        label: 'Listado de Oportunidades',
        query: 'Consultar el listado de oportunidades'
      },
      {
        id: 'prospectos',
        label: 'Listado de Prospectos',
        query: 'Consultar el listado de prospectos'
      },
      {
        id: 'pipeline_ventas',
        label: 'Pipeline de Ventas por Etapa',
        query: 'Muestra el pipeline de ventas por etapa'
      },
      {
        id: 'tasa_conversion',
        label: 'Tasa de Conversión de Prospectos',
        query: 'Cuál es la tasa de conversión de prospectos a clientes'
      },
      {
        id: 'ofertas_timbradas',
        label: 'Ofertas Timbradas vs Pendientes',
        query: 'Muestra cuántas ofertas están timbradas y cuántas pendientes'
      },
      {
        id: 'prospectos_familia',
        label: 'Prospectos por Familia de Producto',
        query: 'Muestra los prospectos activos agrupados por familia de producto'
      }
    ]
  },
  {
    id: 'promotores',
    title: 'Análisis de Promotores',
    icon: Users,
    prompts: [
      {
        id: 'cartera_promotor',
        label: 'Cartera por Promotor',
        query: 'Muestra la cartera de clientes por promotor'
      },
      {
        id: 'valor_cartera',
        label: 'Valor de Cartera por Promotor',
        query: 'Muestra el valor total de la cartera por promotor'
      },
      {
        id: 'performance_promotores',
        label: 'Ranking de Performance',
        query: 'Muestra el ranking de performance de promotores'
      }
    ]
  },
  {
    id: 'geografico',
    title: 'Análisis Geográfico',
    icon: MapPin,
    prompts: [
      {
        id: 'clientes_estado',
        label: 'Distribución por Estado',
        query: 'Muestra la distribución de clientes por estado'
      },
      {
        id: 'concentracion_region',
        label: 'Concentración por Región',
        query: 'Muestra la concentración de cartera por región'
      }
    ]
  },
  {
    id: 'tendencias',
    title: 'Tendencias Temporales',
    icon: TrendingUp,
    prompts: [
      {
        id: 'altas_mensuales',
        label: 'Altas de Clientes por Mes',
        query: 'Muestra las altas de clientes por mes en los últimos 12 meses'
      }
    ]
  },
  {
    id: 'riesgo',
    title: 'Análisis de Riesgo',
    icon: AlertTriangle,
    prompts: [
      {
        id: 'clientes_riesgo',
        label: 'Clientes en Riesgo',
        query: 'Muestra los clientes en riesgo con disminución de saldos mayor al 20%'
      },
      {
        id: 'cross_selling',
        label: 'Oportunidades de Cross-Selling',
        query: 'Muestra las oportunidades de cross-selling (clientes con productos faltantes)'
      }
    ]
  },
  {
    id: 'ejecutivo',
    title: 'Reportes Ejecutivos',
    icon: BarChart3,
    prompts: [
      {
        id: 'resumen_ejecutivo',
        label: 'Resumen Ejecutivo Completo',
        query: 'Muestra el resumen ejecutivo de portafolio'
      },
      {
        id: 'matriz_productos',
        label: 'Matriz de Productos por Cliente',
        query: 'Muestra la matriz de productos por tipo de cliente'
      }
    ]
  }
]

export function PromptLibrary({ onSelectPrompt }: PromptLibraryProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'analisis', 'productos', 'financiero', 'comercial', 'promotores', 'geografico', 'tendencias', 'riesgo', 'ejecutivo'
  ])

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // Filtrado de prompts
  const filteredCategories = PROMPT_CATEGORIES.map(cat => ({
    ...cat,
    prompts: cat.prompts.filter(p => 
      p.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.query.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.prompts.length > 0)

  return (
    <div className={cn(
      "w-80 border-l flex flex-col h-full transition-colors",
      isHey ? "border-white/10 bg-[#1a1f2e]" : "border-gray-200 bg-gray-50",
      "hidden lg:flex" // Ocultar en móvil por ahora o manejar con un drawer
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        isHey ? "border-white/10" : "border-gray-200"
      )}>
        <h3 className={cn(
          "font-semibold mb-1 flex items-center gap-2",
          isHey ? "text-white" : "text-gray-800"
        )}>
          <MessageSquare className="w-4 h-4" />
          Biblioteca de Prompts
        </h3>
        <p className={cn("text-xs", isHey ? "text-gray-400" : "text-gray-500")}>
          Consultas predefinidas
        </p>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className={cn(
            "absolute left-3 top-2.5 w-4 h-4",
            isHey ? "text-gray-500" : "text-gray-400"
          )} />
          <input
            type="text"
            placeholder="Buscar consulta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1",
              isHey 
                ? "bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20" 
                : "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
            )}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredCategories.map(category => (
          <div key={category.id} className="space-y-1">
            <button
              onClick={() => toggleCategory(category.id)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors",
                isHey ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-2">
                <category.icon className="w-3.5 h-3.5" />
                {category.title}
              </div>
              <ChevronRight className={cn(
                "w-3 h-3 transition-transform",
                expandedCategories.includes(category.id) ? "rotate-90" : ""
              )} />
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="space-y-1">
                {category.prompts.map(prompt => (
                  <button
                    key={prompt.id}
                    onClick={() => onSelectPrompt(prompt.query)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all group relative overflow-hidden",
                      isHey 
                        ? "text-gray-300 hover:bg-white/5 hover:text-cyan-300 border border-transparent hover:border-white/5" 
                        : "text-gray-600 hover:bg-white hover:text-orange-600 hover:shadow-sm border border-transparent hover:border-orange-100"
                    )}
                  >
                     <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 opacity-0 transition-opacity",
                        isHey ? "bg-cyan-500 group-hover:opacity-100" : "bg-orange-500 group-hover:opacity-100"
                      )} />
                    {prompt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <p className={cn("text-sm", isHey ? "text-gray-500" : "text-gray-400")}>
              No se encontraron resultados
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
