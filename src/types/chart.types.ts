/**
 * Tipos para la generación de gráficos
 */

/** Tipos de gráficos soportados */
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'composed'

/** Configuración de un gráfico */
export interface ChartConfig {
  type: ChartType
  title?: string
  subtitle?: string
  xAxisKey?: string
  yAxisKey?: string
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  height?: number
  animate?: boolean
}

/** Serie de datos para el gráfico */
export interface ChartSeries {
  name: string
  dataKey: string
  color?: string
  type?: 'bar' | 'line' | 'area'
}

/** Props completas para renderizar un gráfico */
export interface ChartProps {
  config: ChartConfig
  data: Record<string, unknown>[]
  series: ChartSeries[]
}

/** Colores predefinidos para gráficos */
export const CHART_COLORS = {
  primary: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
  success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  accent: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
  mixed: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
} as const


