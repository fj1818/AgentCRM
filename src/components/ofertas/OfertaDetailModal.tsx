/**
 * Detalle de una Oferta con render dinámico por perfil.
 * Campos visibles/editables/enmascarados y orden vienen del UserAccessContext.
 * Incluye la sección "Ciclo de vida" (placeholder).
 */

import { useMemo, useState } from 'react'
import { X, Save } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { CampoCompilado, Oferta, UserAccessContext } from '@/types/ofertas.types'
import { agruparPorSeccion } from '@/config/ofertas.layout.config'
import { formatValue } from './ofertasFormat'
import { CicloDeVidaSection } from './CicloDeVidaSection'

interface Props {
  oferta: Oferta
  ctx: UserAccessContext
  onClose: () => void
  /** Devuelve true si el cambio fue aceptado (revalida permiso en el contenedor) */
  onUpdateCampo: (idOferta: string, key: keyof Oferta, valor: unknown) => boolean
}

export function OfertaDetailModal({ oferta, ctx, onClose, onUpdateCampo }: Props) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  const secciones = useMemo(() => agruparPorSeccion(ctx), [ctx])

  // Buffer de edición local (solo campos editables)
  const [edits, setEdits] = useState<Partial<Record<keyof Oferta, unknown>>>({})
  const [mensaje, setMensaje] = useState<string | null>(null)

  const valorActual = (campo: CampoCompilado): unknown =>
    edits[campo.key] !== undefined ? edits[campo.key] : oferta[campo.key]

  const handleGuardar = () => {
    let aplicados = 0
    let rechazados = 0
    for (const [key, valor] of Object.entries(edits) as [keyof Oferta, unknown][]) {
      const ok = onUpdateCampo(oferta.idOferta, key, valor)
      if (ok) aplicados++
      else rechazados++
    }
    setMensaje(
      rechazados > 0
        ? `Guardado parcial: ${aplicados} aplicado(s), ${rechazados} rechazado(s) por permisos.`
        : `Cambios guardados (${aplicados}).`
    )
    setEdits({})
  }

  const inputClass = cn(
    'w-full px-3 py-2 text-sm rounded-lg border transition-colors',
    isHey
      ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 disabled:opacity-50'
      : 'bg-white border-orange-200 text-gray-800 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500'
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={cn(
          'w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl',
          isHey ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-orange-200'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'sticky top-0 flex items-center justify-between px-6 py-4 border-b',
            isHey ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-orange-100'
          )}
        >
          <div>
            <h2 className={cn('text-lg font-bold', isHey ? 'text-white' : 'text-gray-900')}>
              Oferta {oferta.idOferta}
            </h2>
            <p className={cn('text-xs', isHey ? 'text-gray-400' : 'text-gray-500')}>
              Origen: {oferta.origen === 'cliente' ? 'Oportunidad (cliente)' : 'Prospecto'} · Perfil: {ctx.perfil}
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn('p-2 rounded-lg', isHey ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-orange-50 text-gray-500')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {secciones.map(({ seccion, campos }) => (
            <section key={seccion}>
              <h3 className={cn('text-xs font-semibold uppercase tracking-wider mb-3', isHey ? 'text-cyan-400' : 'text-orange-500')}>
                {seccion}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {campos.map((campo) => (
                  <div key={String(campo.key)} className={campo.ancho >= 12 ? 'col-span-2' : ''}>
                    <label className={cn('block text-xs mb-1', isHey ? 'text-gray-400' : 'text-gray-500')}>
                      {campo.label}
                      {!campo.editable && (
                        <span className={cn('ml-2', isHey ? 'text-gray-600' : 'text-gray-400')}>(solo lectura)</span>
                      )}
                    </label>

                    {/* Enmascarado o no editable -> texto plano */}
                    {campo.masked || !campo.editable ? (
                      <div
                        className={cn(
                          'px-3 py-2 text-sm rounded-lg border',
                          isHey ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
                        )}
                      >
                        {formatValue(campo, oferta)}
                      </div>
                    ) : (
                      <input
                        type={campo.tipoDato === 'Moneda' ? 'number' : 'text'}
                        className={inputClass}
                        value={String(valorActual(campo) ?? '')}
                        onChange={(e) =>
                          setEdits((p) => ({
                            ...p,
                            [campo.key]: campo.tipoDato === 'Moneda' ? Number(e.target.value) : e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Sección ciclo de vida (placeholder) */}
          <CicloDeVidaSection />
        </div>

        {/* Footer */}
        <div
          className={cn(
            'sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t',
            isHey ? 'bg-[#1a1f2e] border-white/10' : 'bg-white border-orange-100'
          )}
        >
          <span className={cn('text-xs', isHey ? 'text-gray-400' : 'text-gray-500')}>{mensaje}</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={cn(
                'px-4 py-2 text-sm rounded-lg',
                isHey ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Cerrar
            </button>
            <button
              onClick={handleGuardar}
              disabled={Object.keys(edits).length === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors',
                Object.keys(edits).length === 0
                  ? isHey
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isHey
                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
              )}
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
