/**
 * Rail lateral: contexto activo, bitácora de acciones y accesos rápidos.
 *
 * La bitácora es deliberadamente visible. Un agente que escribe en el CRM
 * necesita que el usuario pueda ver, en todo momento, qué cambió por su cuenta.
 */

import { cn } from '@/utils'
import { History, PanelRightClose, PanelRightOpen } from 'lucide-react'
import type { AccionRegistrada } from '@/agentic/types'
import { COMANDOS } from '@/agentic/sugerencias'
import { Avatar, Icono, useTema } from './ui'

interface Props {
  abierto: boolean
  onToggle: () => void
  contexto: string | null
  tipoContexto?: 'cliente' | 'oferta'
  bitacora: AccionRegistrada[]
  onEnviar: (prompt: string) => void
}

const hace = (ts: number) => {
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60) return 'hace un momento'
  if (s < 3600) return `hace ${Math.round(s / 60)} min`
  return `hace ${Math.round(s / 3600)} h`
}

export function RailContexto({ abierto, onToggle, contexto, tipoContexto, bitacora, onEnviar }: Props) {
  const t = useTema()

  if (!abierto) {
    return (
      <button
        onClick={onToggle}
        title="Mostrar panel de contexto"
        className={cn(
          'hidden lg:flex flex-col items-center gap-2 w-11 flex-shrink-0 border-l pt-4 transition-colors',
          t.borde,
          t.hey ? 'text-white/50 hover:text-white hover:bg-white/[0.03]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
        )}
      >
        <PanelRightOpen className="w-4 h-4" />
        {bitacora.length > 0 && (
          <span className={cn('text-[10px] font-bold rounded-full px-1.5 py-0.5', t.hey ? 'bg-cyan-500 text-slate-900' : 'bg-orange-500 text-white')}>
            {bitacora.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className={cn('hidden lg:flex flex-col w-72 flex-shrink-0 border-l overflow-hidden', t.borde, t.hey ? 'bg-[#151a26]/60' : 'bg-slate-50/60')}>
      <header className={cn('flex items-center justify-between px-4 py-3 border-b', t.borde)}>
        <h2 className={cn('text-xs font-semibold uppercase tracking-wide', t.textoSuave)}>Contexto</h2>
        <button onClick={onToggle} className={cn('p-1 rounded-lg transition-colors', t.textoSuave, t.hey ? 'hover:bg-white/10' : 'hover:bg-slate-200')} title="Ocultar panel">
          <PanelRightClose className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <section>
          <h3 className={cn('text-[10px] uppercase tracking-wide font-semibold mb-2', t.textoSuave)}>Entidad activa</h3>
          {contexto ? (
            <div className={cn('rounded-xl border p-3 flex items-center gap-2.5', t.card)}>
              <Avatar nombre={contexto} size="sm" />
              <div className="min-w-0">
                <p className={cn('text-[13px] font-medium leading-snug line-clamp-2', t.texto)}>{contexto}</p>
                <p className={cn('text-[11px] capitalize', t.textoSuave)}>{tipoContexto ?? '—'}</p>
              </div>
            </div>
          ) : (
            <p className={cn('text-[12px] leading-relaxed', t.textoSuave)}>
              Abre un cliente o una oferta y quedará fijado aquí como referencia de la conversación.
            </p>
          )}
        </section>

        <section>
          <h3 className={cn('text-[10px] uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5', t.textoSuave)}>
            <History className="w-3 h-3" />
            Acciones ejecutadas
          </h3>
          {bitacora.length ? (
            <ul className="space-y-1.5">
              {bitacora.map((a) => (
                <li key={a.id} className={cn('rounded-xl border p-2.5', t.card)}>
                  <p className={cn('text-[12px] font-medium leading-snug', t.texto)}>{a.titulo}</p>
                  <p className={cn('text-[11px] mt-0.5 leading-snug line-clamp-2', t.textoSuave)}>{a.detalle}</p>
                  <p className={cn('text-[10px] mt-1', t.textoSuave)}>{hace(a.ts)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={cn('text-[12px] leading-relaxed', t.textoSuave)}>
              Todavía no he modificado nada. Cada escritura en el CRM se registra aquí.
            </p>
          )}
        </section>

        <section>
          <h3 className={cn('text-[10px] uppercase tracking-wide font-semibold mb-2', t.textoSuave)}>Comandos</h3>
          <ul className="space-y-0.5">
            {COMANDOS.slice(0, 8).map((c) => (
              <li key={c.comando}>
                <button
                  onClick={() => onEnviar(c.prompt)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors',
                    t.hey ? 'hover:bg-white/[0.06]' : 'hover:bg-white'
                  )}
                >
                  <code className={cn('text-[11px] font-mono font-semibold w-20 flex-shrink-0', t.acento)}>{c.comando}</code>
                  <span className={cn('text-[11.5px] truncate', t.textoSuave)}>{c.descripcion}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className={cn('px-4 py-3 border-t', t.borde)}>
        <p className={cn('text-[11px] leading-relaxed flex items-start gap-1.5', t.textoSuave)}>
          <Icono nombre="shield" className="w-3 h-3 mt-0.5 flex-shrink-0" />
          Ninguna acción se aplica sin tu confirmación explícita.
        </p>
      </footer>
    </aside>
  )
}
