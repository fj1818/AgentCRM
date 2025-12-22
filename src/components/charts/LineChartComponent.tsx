/**
 * Componente de gráfico de líneas
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ChartProps } from '@/types'
import { CHART_COLORS } from '@/types/chart.types'

export function LineChartComponent({ config, data, series }: ChartProps) {
  const {
    xAxisKey = 'name',
    height = 300,
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    colors = CHART_COLORS.primary,
  } = config

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        )}
        <XAxis
          dataKey={xAxisKey}
          stroke="#94a3b8"
          fontSize={12}
          tickLine={false}
        />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
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
        {showLegend && <Legend />}
        {series.map((s, index) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color || colors[index % colors.length]}
            strokeWidth={2}
            dot={{ fill: s.color || colors[index % colors.length], r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

