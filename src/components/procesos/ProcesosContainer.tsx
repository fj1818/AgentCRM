/**
 * Procesos de contratación — flash cards de operaciones.
 * Cada card abre una pantalla (cascarón) del flujo de esa operación.
 */

import { useState } from 'react'
import {
  Wallet, CreditCard, Store, Globe, RefreshCw, TrendingUp, Banknote, Shield,
  ChevronLeft, ArrowRight, FileSignature,
} from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

interface Proceso { id: string; titulo: string; pantalla: string; icon: typeof Wallet }

const PROCESOS: Proceso[] = [
  { id: 'onboarding', titulo: 'Onboarding de cuentas', pantalla: 'Proceso de onboarding de cuentas', icon: Wallet },
  { id: 'aperturacion', titulo: 'Aperturación de líneas', pantalla: 'Proceso de aperturación de líneas', icon: CreditCard },
  { id: 'tpv', titulo: 'Contratación de TPV', pantalla: 'Proceso de contratación de TPV', icon: Store },
  { id: 'banca', titulo: 'Contratación de banca electrónica', pantalla: 'Proceso de contratación de banca electrónica', icon: Globe },
  { id: 'renovacion', titulo: 'Renovación de líneas', pantalla: 'Proceso de renovación de líneas', icon: RefreshCw },
  { id: 'inversiones', titulo: 'Contratación de inversiones', pantalla: 'Proceso de contratación de inversiones', icon: TrendingUp },
  { id: 'nomina', titulo: 'Contratación de nómina', pantalla: 'Proceso de contratación de nómina', icon: Banknote },
  { id: 'seguros', titulo: 'Contratación de seguros', pantalla: 'Proceso de contratación de seguros', icon: Shield },
]

export function ProcesosContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [sel, setSel] = useState<Proceso | null>(null)

  // ── Pantalla del proceso (cascarón) ───────────────────────────────────────
  if (sel) {
    return (
      <div className={cn('flex flex-col h-full overflow-hidden', isHey ? 'bg-[#0f1219]' : 'bg-gray-50')}>
        <div className={cn('px-6 py-4 border-b shrink-0 flex items-center gap-3', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
          <button onClick={() => setSel(null)} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm', isHey ? 'text-cyan-400 hover:bg-white/10' : 'text-orange-500 hover:bg-orange-100')}>
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}><sel.icon className="w-6 h-6" /></div>
          <h1 className={cn('text-2xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>{sel.pantalla}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className={cn('rounded-xl border border-dashed p-10 text-center', isHey ? 'border-white/15 text-gray-400' : 'border-orange-200 text-gray-500')}>
            <FileSignature className={cn('w-8 h-8 mx-auto mb-3', isHey ? 'text-cyan-400/70' : 'text-orange-400')} />
            <p className="font-medium">{sel.pantalla}</p>
            <p className="text-sm mt-1">Pantalla en construcción — aquí ocurrirá el flujo de la operación.</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Galería de flash cards ────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col h-full overflow-hidden', isHey ? 'bg-[#0f1219]' : 'bg-gray-50')}>
      <div className={cn('px-6 py-4 border-b shrink-0 flex items-center gap-3', isHey ? 'border-white/10 bg-[#1a1f2e]' : 'border-orange-100 bg-white')}>
        <div className={cn('p-2 rounded-lg', isHey ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-100 text-orange-600')}><FileSignature className="w-6 h-6" /></div>
        <div>
          <h1 className={cn('text-2xl font-bold', isHey ? 'text-white' : 'text-gray-900')}>Procesos de contratación</h1>
          <p className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>Selecciona la operación a ejecutar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PROCESOS.map((p) => (
            <button key={p.id} onClick={() => setSel(p)}
              className={cn('group text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5',
                isHey ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40' : 'border-orange-200 bg-white hover:shadow-md hover:border-orange-300')}>
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-3', isHey ? 'bg-cyan-500/15 text-cyan-400' : 'bg-orange-100 text-orange-600')}>
                <p.icon className="w-6 h-6" />
              </div>
              <div className={cn('font-semibold leading-snug', isHey ? 'text-white' : 'text-gray-800')}>{p.titulo}</div>
              <div className={cn('flex items-center gap-1 text-xs mt-3', isHey ? 'text-cyan-400' : 'text-orange-500')}>
                Iniciar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
