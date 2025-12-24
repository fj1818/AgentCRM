/**
 * Componente de gráficos usando Chart.js
 * Renderiza gráficos dinámicos basados en el tipo especificado
 */

import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar, Pie, Line, Doughnut, PolarArea } from 'react-chartjs-2'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface ChartDataPoint {
  x: string
  value: number
}

interface DynamicChartProps {
  tipo: 'pie' | 'bar' | 'line' | 'column' | 'polar'
  titulo: string
  datos: ChartDataPoint[]
  height?: number
}

// Colores para el gráfico
const COLORES = [
  'rgba(255, 136, 0, 0.8)',   // Naranja principal
  'rgba(30, 64, 175, 0.8)',   // Azul oscuro
  'rgba(6, 182, 212, 0.8)',   // Cyan
  'rgba(16, 185, 129, 0.8)',  // Verde
  'rgba(139, 92, 246, 0.8)',  // Púrpura
  'rgba(236, 72, 153, 0.8)',  // Rosa
  'rgba(245, 158, 11, 0.8)',  // Ámbar
  'rgba(59, 130, 246, 0.8)',  // Azul
]

const COLORES_BORDE = COLORES.map(c => c.replace('0.8', '1'))

export function DynamicChart({ tipo, titulo, datos, height = 350 }: DynamicChartProps) {
  const chartRef = useRef(null)

  // Preparar datos para Chart.js
  const labels = datos.map(d => d.x)
  const values = datos.map(d => d.value)

  const chartData: ChartData<'bar' | 'pie' | 'line' | 'doughnut' | 'polarArea'> = {
    labels,
    datasets: [
      {
        label: titulo,
        data: values,
        backgroundColor: COLORES.slice(0, datos.length),
        borderColor: COLORES_BORDE.slice(0, datos.length),
        borderWidth: 2,
      },
    ],
  }

  // Detectar si los valores son montos grandes (probablemente dinero)
  const maxValue = Math.max(...values)
  const esMoneda = maxValue > 1000

  // Formatear valor como moneda o número
  const formatearValor = (valor: number): string => {
    if (esMoneda) {
      return `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return valor.toLocaleString('es-MX')
  }

  const baseOptions: ChartOptions<'bar' | 'pie' | 'line' | 'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: titulo,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 14,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          label: function(context) {
            // context.raw contiene el valor real independiente de la orientación
            // Para barras horizontales parsed.x tiene el valor, para verticales parsed.y
            // Usar raw que siempre es el valor numérico
            const value = context.raw as number
            const valorFormateado = formatearValor(value)
            // Usar el label del array
            const label = labels[context.dataIndex] || context.dataset.label || ''
            return `${label}: ${valorFormateado}`
          },
          title: function(context) {
            // Mostrar el nombre de la categoría (estado, producto, etc.)
            const idx = context[0]?.dataIndex
            return idx !== undefined ? (labels[idx] || '') : ''
          }
        }
      },
    },
  }

  const barOptions: ChartOptions<'bar'> = {
    ...baseOptions,
    indexAxis: tipo === 'bar' ? 'y' : 'x',
    scales: {
      x: {
        // Para barras horizontales (tipo='bar'), el eje X muestra los VALORES
        // Para barras verticales (column), el eje X muestra las ETIQUETAS
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: tipo === 'bar' && esMoneda,
          text: 'Monto (MXN)',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        // Solo aplicar callback para barras horizontales (donde X tiene valores numéricos)
        ticks: tipo === 'bar' ? {
          callback: function(value) {
            if (esMoneda) {
              return `$${Number(value).toLocaleString('es-MX')}`
            }
            return value
          }
        } : {},
        beginAtZero: tipo === 'bar',
      },
      y: {
        // Para barras horizontales (tipo='bar'), el eje Y muestra las ETIQUETAS
        grid: {
          display: tipo !== 'bar',
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: tipo !== 'bar' && esMoneda,
          text: 'Monto (MXN)',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        // Para barras horizontales NO usar callback - Chart.js usa labels automáticamente
        // Para barras verticales (column), formatear valores como pesos
        ticks: tipo === 'bar' ? {} : {
          callback: function(value) {
            if (esMoneda) {
              return `$${Number(value).toLocaleString('es-MX')}`
            }
            return value
          }
        },
        beginAtZero: tipo !== 'bar',
      },
    },
  }

  // Limpiar chart al desmontar
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        // @ts-expect-error - destroy method exists
        chartRef.current?.destroy?.()
      }
    }
  }, [])

  // Opciones específicas para gráficos de pastel/dona con porcentajes
  const total = values.reduce((a, b) => a + b, 0)
  
  const pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 12 },
          generateLabels: function(chart) {
            const data = chart.data
            if (data.labels?.length && data.datasets.length) {
              return (data.labels as string[]).map((label, i) => {
                const value = (data.datasets[0].data[i] as number) || 0
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: (data.datasets[0].backgroundColor as string[])?.[i] || COLORES[i],
                  strokeStyle: (data.datasets[0].borderColor as string[])?.[i] || COLORES_BORDE[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                }
              })
            }
            return []
          }
        },
      },
      title: {
        display: true,
        text: titulo,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 14,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 14 },
        callbacks: {
          label: function(context) {
            const value = context.raw as number
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            const valorFormateado = formatearValor(value)
            const label = context.label || ''
            return `${label}: ${valorFormateado} (${percentage}%)`
          }
        }
      },
    },
  }

  // Opciones específicas para gráfico Polar Area
  const polarOptions: ChartOptions<'polarArea'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          display: true,
          callback: function(value) {
            if (esMoneda) {
              return `$${Number(value).toLocaleString('es-MX')}`
            }
            return value
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 12 },
          generateLabels: function(chart) {
            const data = chart.data
            if (data.labels?.length && data.datasets.length) {
              return (data.labels as string[]).map((label, i) => {
                const value = (data.datasets[0].data[i] as number) || 0
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: (data.datasets[0].backgroundColor as string[])?.[i] || COLORES[i],
                  strokeStyle: (data.datasets[0].borderColor as string[])?.[i] || COLORES_BORDE[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                }
              })
            }
            return []
          }
        },
      },
      title: {
        display: true,
        text: titulo,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 14,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 14 },
        callbacks: {
          label: function(context) {
            const value = context.raw as number
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            const valorFormateado = formatearValor(value)
            const label = context.label || ''
            return `${label}: ${valorFormateado} (${percentage}%)`
          }
        }
      },
    },
  }

  const renderChart = () => {
    switch (tipo) {
      case 'pie':
        return <Doughnut ref={chartRef} data={chartData as ChartData<'doughnut'>} options={pieOptions} />
      case 'polar':
        return <PolarArea ref={chartRef} data={chartData as ChartData<'polarArea'>} options={polarOptions} />
      case 'bar':
        return <Bar ref={chartRef} data={chartData as ChartData<'bar'>} options={barOptions} />
      case 'column':
        return <Bar ref={chartRef} data={chartData as ChartData<'bar'>} options={{ ...barOptions, indexAxis: 'x' }} />
      case 'line':
        return <Line ref={chartRef} data={chartData as ChartData<'line'>} options={baseOptions as ChartOptions<'line'>} />
      default:
        return <Bar ref={chartRef} data={chartData as ChartData<'bar'>} options={barOptions} />
    }
  }

  if (!datos.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos para mostrar
      </div>
    )
  }

  return (
    <div 
      style={{ height: `${height}px` }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-theme p-4 shadow-lg"
    >
      {renderChart()}
    </div>
  )
}
