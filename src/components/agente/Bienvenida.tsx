/**
 * Pantalla inicial del chat.
 *
 * Un chat vacío no comunica lo que sabe hacer. Esta pantalla es el catálogo de
 * capacidades: cada tarjeta es un prompt real que se dispara al pulsarla.
 */

import { cn } from '@/utils'
import { SUGERENCIAS } from '@/agentic/sugerencias'
import { clientes, ofertas, ETAPAS_ABIERTAS, YO, formatoMoneda } from '@/agentic/data'
import { Icono, useTema } from './ui'

const GRUPOS = ['Ejecutar', 'Vender', 'Analizar', 'Aprender'] as const

export function Bienvenida({ onElegir }: { onElegir: (prompt: string) => void }) {
  const t = useTema()

  const mias = ofertas.filter((o) => o.ejecutivo === YO && ETAPAS_ABIERTAS.includes(o.etapa))
  const cartera = clientes.filter((c) => c.ejecutivo === YO)
  const monto = mias.reduce((a, o) => a + o.monto, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-8">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border',
            t.hey ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' : 'bg-orange-100 border-orange-200 text-orange-600'
          )}
        >
          <Icono nombre="sparkles" className="w-7 h-7" />
        </div>
        <h1 className={cn('text-2xl sm:text-3xl font-bold tracking-tight', t.texto)}>
          Tu CRM, en una conversación
        </h1>
        <p className={cn('text-sm mt-2 max-w-lg mx-auto leading-relaxed', t.textoSuave)}>
          Consulta, analiza y ejecuta sin salir del chat. Te respondo con tarjetas, tablas y
          formularios que puedes usar directo aquí.
        </p>
      </div>

      <div className={cn('flex items-center justify-center gap-6 sm:gap-10 mb-8 py-4 rounded-2xl border', t.card)}>
        {[
          { valor: String(cartera.length), etiqueta: 'clientes en cartera' },
          { valor: String(mias.length), etiqueta: 'ofertas abiertas' },
          { valor: formatoMoneda(monto), etiqueta: 'en el embudo' },
        ].map((d) => (
          <div key={d.etiqueta} className="text-center">
            <div className={cn('text-lg sm:text-xl font-bold tabular-nums', t.texto)}>{d.valor}</div>
            <div className={cn('text-[11px] uppercase tracking-wide', t.textoSuave)}>{d.etiqueta}</div>
          </div>
        ))}
      </div>

      {GRUPOS.map((grupo) => {
        const items = SUGERENCIAS.filter((s) => s.grupo === grupo)
        if (!items.length) return null
        return (
          <div key={grupo} className="mb-5">
            <h2 className={cn('text-[11px] uppercase tracking-wide font-semibold mb-2', t.textoSuave)}>{grupo}</h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {items.map((s) => (
                <button
                  key={s.prompt}
                  onClick={() => onElegir(s.prompt)}
                  className={cn(
                    'group flex items-start gap-3 text-left rounded-2xl border p-3.5 transition-all duration-200',
                    t.card,
                    t.cardHover
                  )}
                >
                  <span
                    className={cn(
                      'p-2 rounded-xl flex-shrink-0 transition-colors',
                      t.hey ? 'bg-white/[0.06] text-cyan-300' : 'bg-orange-50 text-orange-600'
                    )}
                  >
                    <Icono nombre={s.icono} className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block text-[13.5px] font-medium leading-snug', t.texto)}>{s.titulo}</span>
                    <span className={cn('block text-[12px] mt-0.5 leading-snug', t.textoSuave)}>{s.descripcion}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
