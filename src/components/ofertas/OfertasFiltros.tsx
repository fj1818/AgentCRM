/**
 * Filtros multiselect en cascada de Ofertas (replica OF_FILTERS de AppClient.html).
 * Niveles por orden de activación; las opciones de cada filtro dependen de los
 * filtros activados antes (upstream). Emite las ofertas filtradas vía onApply.
 */

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { Offer } from '@/data/ofertas-seed'
import { distinct } from './ofertasFormat'

type FKey = 'tipoPersona' | 'tipoOferta' | 'familia' | 'producto' | 'etapa'

const OF_FILTERS: { key: FKey; label: string }[] = [
  { key: 'tipoPersona', label: 'Tipo de persona' },
  { key: 'tipoOferta', label: 'Tipo de oferta' },
  { key: 'familia', label: 'Familia de producto' },
  { key: 'producto', label: 'Tipo de producto' },
  { key: 'etapa', label: 'Etapa' },
]

interface Props {
  offers: Offer[]
  onApply: (filtered: Offer[]) => void
}

export function OfertasFiltros({ offers, onApply }: Props) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  const [selected, setSelected] = useState<Record<FKey, Record<string, boolean>>>({
    tipoPersona: {}, tipoOferta: {}, familia: {}, producto: {}, etapa: {},
  })
  const [order, setOrder] = useState<FKey[]>([])
  const [openKey, setOpenKey] = useState<FKey | null>(null)
  const [search, setSearch] = useState<Record<FKey, string>>({
    tipoPersona: '', tipoOferta: '', familia: '', producto: '', etapa: '',
  })

  const selVals = (k: FKey) => Object.keys(selected[k])
  const upstreamKeys = (k: FKey) => { const i = order.indexOf(k); return i === -1 ? order.slice() : order.slice(0, i) }
  const rowsBy = (keys: FKey[]) => offers.filter((o) => keys.every((k) => selected[k][o[k]]))
  const optionsFor = (k: FKey) => distinct(rowsBy(upstreamKeys(k)).map((o) => o[k]))

  const filtered = useMemo(() => {
    const active = order.slice()
    return offers.filter((o) => active.every((k) => selected[k][o[k]]))
  }, [offers, order, selected])

  useEffect(() => { onApply(filtered) }, [filtered, onApply])

  function prune(nextSelected: Record<FKey, Record<string, boolean>>, nextOrder: FKey[]) {
    const newOrder: FKey[] = []
    nextOrder.forEach((key) => {
      const avail: Record<string, number> = {}
      offers.filter((o) => newOrder.every((k) => nextSelected[k][o[k]])).forEach((o) => { avail[o[key]] = 1 })
      Object.keys(nextSelected[key]).forEach((v) => { if (!avail[v]) delete nextSelected[key][v] })
      if (Object.keys(nextSelected[key]).length) newOrder.push(key)
    })
    return newOrder
  }

  function toggle(key: FKey, value: string, checked: boolean) {
    setSelected((prev) => {
      const next = { ...prev, [key]: { ...prev[key] } }
      if (checked) next[key][value] = true
      else delete next[key][value]
      setOrder((prevOrder) => {
        let no = prevOrder.slice()
        const active = Object.keys(next[key]).length > 0
        const i = no.indexOf(key)
        if (active && i === -1) no.push(key)
        if (!active && i !== -1) no.splice(i, 1)
        return prune(next, no)
      })
      return next
    })
  }

  function setAll(key: FKey, all: boolean) {
    setSelected((prev) => {
      const next = { ...prev, [key]: all ? Object.fromEntries(optionsFor(key).map((v) => [v, true])) : {} }
      setOrder((prevOrder) => {
        let no = prevOrder.slice()
        const active = Object.keys(next[key]).length > 0
        const i = no.indexOf(key)
        if (active && i === -1) no.push(key)
        if (!active && i !== -1) no.splice(i, 1)
        return prune(next, no)
      })
      return next
    })
  }

  function limpiar() {
    setSelected({ tipoPersona: {}, tipoOferta: {}, familia: {}, producto: {}, etapa: {} })
    setOrder([])
    setSearch({ tipoPersona: '', tipoOferta: '', familia: '', producto: '', etapa: '' })
  }

  const cardCls = cn('rounded-xl border p-3', isHey ? 'border-white/10 bg-white/5' : 'border-orange-200 bg-white')

  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-sm font-semibold', isHey ? 'text-white' : 'text-gray-800')}>
          Filtros{' '}
          <span className={cn('ml-1 text-xs px-2 py-0.5 rounded-full', isHey ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-100 text-orange-600')}>
            {order.length} {order.length === 1 ? 'activo' : 'activos'}
          </span>
        </span>
        <button onClick={limpiar} className={cn('text-xs', isHey ? 'text-cyan-400 hover:underline' : 'text-orange-600 hover:underline')}>
          Limpiar filtros
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {OF_FILTERS.map((f) => {
          const lvl = order.indexOf(f.key)
          const n = selVals(f.key).length
          const opts = optionsFor(f.key).filter((v) => !search[f.key] || v.toLowerCase().includes(search[f.key].toLowerCase()))
          return (
            <div key={f.key} className="relative">
              <div className={cn('text-[10px] uppercase tracking-wide mb-0.5 flex items-center gap-1', isHey ? 'text-gray-400' : 'text-gray-500')}>
                {f.label}
                {lvl !== -1 && <span className={cn('px-1 rounded', isHey ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-100 text-orange-600')}>L{lvl + 1}</span>}
              </div>
              <button
                onClick={() => setOpenKey(openKey === f.key ? null : f.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border min-w-[150px] justify-between',
                  lvl !== -1
                    ? isHey ? 'border-cyan-500/40 bg-cyan-500/10 text-white' : 'border-orange-300 bg-orange-50 text-gray-800'
                    : isHey ? 'border-white/10 bg-white/5 text-gray-300' : 'border-orange-200 bg-white text-gray-700'
                )}
              >
                <span>{n ? `${n} seleccionado${n > 1 ? 's' : ''}` : 'Todos'}</span>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>

              {openKey === f.key && (
                <div className={cn('absolute z-20 mt-1 w-64 rounded-lg border shadow-lg p-2', isHey ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-orange-200')}>
                  <input
                    value={search[f.key]}
                    onChange={(e) => setSearch((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder="Buscar…"
                    className={cn('w-full mb-2 px-2 py-1 text-sm rounded border', isHey ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-orange-200 text-gray-800')}
                  />
                  <div className="flex gap-2 mb-2 text-xs">
                    <button onClick={() => setAll(f.key, true)} className={isHey ? 'text-cyan-400' : 'text-orange-600'}>Seleccionar todos</button>
                    <button onClick={() => setAll(f.key, false)} className={isHey ? 'text-gray-400' : 'text-gray-500'}>Deseleccionar</button>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {opts.length === 0 && <div className={cn('text-xs px-1', isHey ? 'text-gray-500' : 'text-gray-400')}>Sin opciones</div>}
                    {opts.map((v) => (
                      <label key={v} className={cn('flex items-center gap-2 px-1 py-1 text-sm rounded cursor-pointer', isHey ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-orange-50 text-gray-700')}>
                        <input type="checkbox" checked={!!selected[f.key][v]} onChange={(e) => toggle(f.key, v, e.target.checked)} />
                        <span>{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
