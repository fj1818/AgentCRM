/**
 * Contenedor genérico para gráficos
 * Renderiza el tipo de gráfico correcto basado en la configuración
 */

import type { ChartProps } from '@/types'
import { BarChartComponent } from './BarChartComponent'
import { LineChartComponent } from './LineChartComponent'
import { PieChartComponent } from './PieChartComponent'
import { Card } from '@/components/common'

interface ChartContainerProps extends ChartProps {
  className?: string
}

export function ChartContainer({ config, data, series, className }: ChartContainerProps) {
  const { type, title, subtitle } = config

  const ChartComponent = {
    bar: BarChartComponent,
    line: LineChartComponent,
    pie: PieChartComponent,
    area: LineChartComponent, // Reutilizamos line para area
    composed: BarChartComponent, // Por ahora
  }[type]

  return (
    <Card className={className}>
      {(title || subtitle) && (
        <Card.Header>
          {title && <Card.Title>{title}</Card.Title>}
          {subtitle && (
            <p className="text-sm text-surface-400 mt-1">{subtitle}</p>
          )}
        </Card.Header>
      )}
      <Card.Content>
        <ChartComponent config={config} data={data} series={series} />
      </Card.Content>
    </Card>
  )
}

