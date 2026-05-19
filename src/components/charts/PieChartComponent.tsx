/**
 * Componente de gráfico circular
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ChartProps } from '@/types'
import { CHART_COLORS } from '@/types/chart.types'

export function PieChartComponent({ config, data, series }: ChartProps) {
  const {
    height = 300,
    showLegend = true,
    showTooltip = true,
    colors = CHART_COLORS.mixed,
  } = config

  const dataKey = series[0]?.dataKey || 'value'
  const nameKey = config.xAxisKey || 'name'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={50}
          paddingAngle={2}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
        )}
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: '#e2e8f0' }}>{value}</span>
            )}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}


