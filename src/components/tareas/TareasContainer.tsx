/**
 * Tareas Container — Split Screen.
 * Izquierda: acordeones (Mi Día, Agenda Semanal).
 * Derecha: Asistente de Agenda local (sin n8n), homologado al de Ofertas.
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight, Calendar, Clock, ListChecks, UserPlus } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { AgendaCalendar } from './AgendaCalendar'
import { CronogramaDiario } from './CronogramaDiario'
import { AsistenteTareasPanel } from './AsistenteTareasPanel'
import { TareasOfertaLista } from './TareasOfertaLista'

function AccordionItem({ titulo, icono: Icono, children, defaultOpen = false }: {
  titulo: string; icono: React.ElementType; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  return (
    <div className={cn('border rounded-xl overflow-hidden', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')}>
      <button onClick={() => setIsOpen(!isOpen)} className={cn('w-full flex items-center justify-between px-4 py-3 transition-colors', isHey ? 'hover:bg-white/10' : 'hover:bg-orange-50')}>
        <div className="flex items-center gap-3">
          <Icono className={cn('w-5 h-5', isHey ? 'text-cyan-400' : 'text-orange-500')} />
          <span className={cn('font-semibold', isHey ? 'text-white' : 'text-gray-800')}>{titulo}</span>
        </div>
        {isOpen ? <ChevronDown className={cn('w-5 h-5', isHey ? 'text-gray-400' : 'text-gray-500')} /> : <ChevronRight className={cn('w-5 h-5', isHey ? 'text-gray-400' : 'text-gray-500')} />}
      </button>
      {isOpen && <div className={cn('border-t px-4 py-3', isHey ? 'border-white/10' : 'border-orange-100')}>{children}</div>}
    </div>
  )
}

export function TareasContainer() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [fechaActual, setFechaActual] = useState(new Date())

  return (
    <div className={cn('flex h-full', isHey ? 'bg-gradient-to-b from-[#1a1f2e] via-[#1f2537] to-[#232a3c]' : 'bg-gradient-to-b from-orange-50/50 via-white to-orange-50/30')}>
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className={cn('text-2xl font-bold mb-6', isHey ? 'text-white' : 'text-gray-800')}>Tareas y Agenda</h1>
        <div className="space-y-4">
          <AccordionItem titulo="Mi Día" icono={Clock} defaultOpen={true}>
            <div className="space-y-5">
              <div>
                <div className={cn('flex items-center gap-2 mb-2 text-sm font-semibold', isHey ? 'text-white' : 'text-gray-800')}>
                  <ListChecks className={cn('w-4 h-4', isHey ? 'text-cyan-400' : 'text-orange-500')} /> Mis tareas
                </div>
                <TareasOfertaLista modo="mias" />
              </div>
              <CronogramaDiario fechaActual={fechaActual} onFechaChange={setFechaActual} />
            </div>
          </AccordionItem>
          <AccordionItem titulo="Tareas que asigné" icono={UserPlus} defaultOpen={false}>
            <TareasOfertaLista modo="asignadas" />
          </AccordionItem>
          <AccordionItem titulo="Agenda Semanal" icono={Calendar} defaultOpen={false}>
            <AgendaCalendar />
          </AccordionItem>
        </div>
      </div>

      <div className="w-[420px] shrink-0">
        <AsistenteTareasPanel onEventoCreado={setFechaActual} />
      </div>
    </div>
  )
}
