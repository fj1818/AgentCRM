/**
 * Modal Reasignar ofertas (RN-165 / RT-162). Lista ejecutivos con búsqueda.
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '@/stores'
import { useOfertasStore } from '@/stores/ofertas.store'
import { cn } from '@/utils'

export function ReasignarModal({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const { users, reassignOffers } = useOfertasStore()
  const [q, setQ] = useState('')

  const lista = users.filter((u) => !q || (u.nombre + ' ' + u.numero + ' ' + u.idPromotor).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={cn('w-full max-w-md rounded-2xl border p-5', isHey ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-orange-200')} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={cn('text-lg font-bold', isHey ? 'text-white' : 'text-gray-900')}>Reasignar ofertas</h2>
          <button onClick={onClose} className={cn('p-2 rounded-lg', isHey ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-orange-50 text-gray-500')}><X className="w-5 h-5" /></button>
        </div>
        <p className={cn('text-sm mb-2', isHey ? 'text-gray-300' : 'text-gray-600')}>Selecciona el ejecutivo para <b>{ids.length}</b> oferta(s):</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejecutivo…"
          className={cn('w-full px-3 py-2 text-sm rounded-lg border mb-2', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')} />
        <div className={cn('max-h-64 overflow-y-auto rounded-lg border', isHey ? 'border-white/10' : 'border-orange-200')}>
          {lista.length === 0 && <div className={cn('text-sm px-3 py-2', isHey ? 'text-gray-500' : 'text-gray-400')}>Sin ejecutivos.</div>}
          {lista.map((u) => (
            <button key={u.idPromotor} onClick={() => { reassignOffers(ids, u.idPromotor); onClose() }}
              className={cn('block w-full text-left px-3 py-2 text-sm', isHey ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-orange-50 text-gray-700')}>
              <b>{u.nombre}</b> <span className={isHey ? 'text-gray-400' : 'text-gray-500'}>· #{u.numero} · {u.idPromotor}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
