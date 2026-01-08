import { X } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import type { OfertaCliente } from '@/types/ofertaCliente.types'

interface DetalleOfertaModalProps {
  oferta: OfertaCliente & { promotorNombre?: string, nombreRazonSocial?: string, tipoPersona?: string, familia?: string, producto?: string }
  onClose: () => void
}

export function DetalleOfertaModal({ oferta, onClose }: DetalleOfertaModalProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
        isHey ? "bg-[#1a1f2e] border border-white/10" : "bg-white border border-gray-100"
      )}>
        {/* Header */}
        <div className={cn(
          "px-6 py-4 flex items-center justify-between border-b",
          isHey ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50/50"
        )}>
          <div>
            <h2 className={cn("text-lg font-bold", isHey ? "text-white" : "text-gray-900")}>
              Detalle de Oferta
            </h2>
            <p className={cn("text-xs mt-0.5", isHey ? "text-gray-400" : "text-gray-500")}>
              ID: {oferta.idOferta}
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-full transition-colors",
              isHey ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-400"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Layout: Grid for standard info, full width for description */}
          
          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={cn(
              "p-4 rounded-xl border",
              isHey ? "bg-white/5 border-white/10" : "bg-blue-50/50 border-blue-100"
            )}>
              <span className={cn("text-xs block mb-1", isHey ? "text-gray-400" : "text-blue-600/80")}>
                Producto
              </span>
              <div className={cn("font-semibold text-lg", isHey ? "text-cyan-400" : "text-gray-900")}>
                {oferta.producto}
              </div>
              <div className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>
                {oferta.familia}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-xl border",
              isHey ? "bg-white/5 border-white/10" : "bg-emerald-50/50 border-emerald-100"
            )}>
              <span className={cn("text-xs block mb-1", isHey ? "text-gray-400" : "text-emerald-600/80")}>
                Monto Oferta
              </span>
              <div className={cn("font-semibold text-lg", isHey ? "text-emerald-400" : "text-green-700")}>
                {formatCurrency(oferta.montoOferta)}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-xl border",
              isHey ? "bg-white/5 border-white/10" : "bg-purple-50/50 border-purple-100"
            )}>
              <span className={cn("text-xs block mb-1", isHey ? "text-gray-400" : "text-purple-600/80")}>
                Promotor Asignado
              </span>
              <div className={cn("font-semibold truncate", isHey ? "text-white" : "text-gray-900")}>
                {oferta.promotorNombre}
              </div>
              <div className={cn("text-xs font-mono mt-0.5", isHey ? "text-gray-500" : "text-gray-500")}>
                #{oferta.numeroPromotor}
              </div>
            </div>
          </div>

          {/* Description Section (Priority) */}
          <div className="mb-6">
            <h3 className={cn(
              "text-sm font-medium mb-2 flex items-center gap-2",
              isHey ? "text-gray-300" : "text-gray-700"
            )}>
              Descripción / Script
              <span className={cn("text-xs px-2 py-0.5 rounded-full", isHey ? "bg-white/10" : "bg-gray-100 text-gray-600")}>
                Importante
              </span>
            </h3>
            <div className={cn(
              "p-4 rounded-xl border min-h-[120px] whitespace-pre-wrap leading-relaxed",
              isHey ? "bg-white/5 border-white/10 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
            )}>
              {oferta.descripcionOferta}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t hover:border-transparent transition-colors border-dashed" style={{ borderColor: isHey ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>
            <div>
              <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>
                Campaña
              </span>
              <span className={cn("text-sm font-medium", isHey ? "text-gray-300" : "text-gray-700")}>
                {oferta.campaña}
              </span>
            </div>
            
            <div>
              <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>
                Etapa
              </span>
              <span className={cn(
                "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
                isHey ? "bg-white/10 text-white" : "bg-gray-100 text-gray-800"
              )}>
                {oferta.etapa}
              </span>
            </div>

            <div>
              <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>
                Fecha Alta
              </span>
              <span className={cn("text-sm font-medium", isHey ? "text-gray-300" : "text-gray-700")}>
                {oferta.fechaAlta}
              </span>
            </div>

            <div>
              <span className={cn("text-xs block mb-0.5", isHey ? "text-gray-500" : "text-gray-400")}>
                ID Cliente
              </span>
              <span className={cn("text-sm font-medium font-mono", isHey ? "text-gray-400" : "text-gray-600")}>
                {oferta.ide}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
