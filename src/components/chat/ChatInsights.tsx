/**
 * Tarjetas KPI e insight analítico ("el porqué") para las respuestas del chat.
 */

import ReactMarkdown from 'react-markdown'
import { Lightbulb } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

export interface KpiCard {
  etiqueta: string
  valor: string
  tono?: 'positivo' | 'negativo' | 'neutro'
}

export function KpiCards({ kpis }: { kpis: KpiCard[] }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  if (!kpis?.length) return null

  return (
    <div className="max-w-5xl mx-auto my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className={cn(
            'rounded-2xl border p-4 shadow-sm',
            isHey
              ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-xl'
              : 'bg-gradient-to-br from-orange-50 to-white border-orange-100'
          )}
        >
          <p className={cn('text-xs font-medium uppercase tracking-wider mb-1', isHey ? 'text-cyan-300/80' : 'text-orange-500')}>
            {kpi.etiqueta}
          </p>
          <p
            className={cn(
              'text-2xl font-bold leading-tight break-words',
              kpi.tono === 'negativo'
                ? 'text-red-500'
                : kpi.tono === 'positivo'
                ? 'text-emerald-500'
                : isHey
                ? 'text-white'
                : 'text-gray-800'
            )}
          >
            {kpi.valor}
          </p>
        </div>
      ))}
    </div>
  )
}

export function InsightCallout({ texto }: { texto: string }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  if (!texto?.trim()) return null

  return (
    <div className="max-w-5xl mx-auto my-4 animate-fade-in">
      <div
        className={cn(
          'rounded-2xl border p-4 flex gap-3',
          isHey ? 'bg-amber-400/10 border-amber-400/20' : 'bg-amber-50 border-amber-200'
        )}
      >
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
            isHey ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-600'
          )}
        >
          <Lightbulb className="w-5 h-5" />
        </div>
        <div
          className={cn(
            'text-sm leading-relaxed prose-sm max-w-none',
            isHey ? 'text-amber-100/90' : 'text-amber-900'
          )}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
              li: ({ children }) => <li>{children}</li>,
            }}
          >
            {texto}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
