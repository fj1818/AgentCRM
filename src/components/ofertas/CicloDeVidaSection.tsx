/**
 * Sección "Ciclo de vida" — placeholder.
 * El contenido (stepper de etapas / timeline) se definirá más adelante.
 */

import { GitBranch } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

export function CicloDeVidaSection() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  return (
    <section
      className={cn(
        'rounded-xl border border-dashed p-6 text-center',
        isHey ? 'border-white/15 bg-white/5' : 'border-orange-200 bg-orange-50/40'
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <GitBranch className={cn('w-6 h-6', isHey ? 'text-cyan-400/70' : 'text-orange-400')} />
        <h3 className={cn('font-semibold', isHey ? 'text-white' : 'text-gray-800')}>
          Ciclo de vida
        </h3>
        <p className={cn('text-sm', isHey ? 'text-gray-400' : 'text-gray-500')}>
          Sección en construcción. Aquí se definirá el seguimiento del ciclo de vida de la oferta.
        </p>
      </div>
    </section>
  )
}
