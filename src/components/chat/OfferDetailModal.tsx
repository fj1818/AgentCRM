import { X, Calendar, DollarSign, Tag, Briefcase, CreditCard, Hash } from 'lucide-react'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'

interface OfferDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data: Record<string, unknown> | null
}

export function OfferDetailModal({ isOpen, onClose, data }: OfferDetailModalProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'

  if (!isOpen || !data) return null

  // Función auxiliar para traducir keys
  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      idOferta: 'ID de Oferta',
      ide: 'ID Cliente',
      idProspecto: 'ID Prospecto',
      familiaProducto: 'Familia',
      productoInteres: 'Producto',
      fechaAlta: 'Fecha Alta',
      fechaBaja: 'Fecha Baja',
      etapa: 'Etapa Actual',
      campaña: 'Campaña Origen',
      montoInteres: 'Monto Interés',
      montoOferta: 'Monto Oferta',
      montoTimbrado: 'Monto Timbrado',
      fechaTimbrado: 'Fecha Timbrado',
      idOportunidad: 'ID Oportunidad',
      numeroPromotor: 'Promotor Asignado',
      nombre: 'Nombre Cliente',
      rfc: 'RFC',
      tipoPersona: 'Tipo Persona'
    }
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  }

  // Función para formatear valores
  const getValue = (key: string, value: unknown) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('monto') || key.toLowerCase().includes('linea') || key.toLowerCase().includes('saldo')) {
        return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      }
    }
    return String(value)
  }

  const getIcon = (key: string) => {
    if (key.includes('fecha')) return <Calendar className="w-4 h-4" />
    if (key.includes('monto') || key.includes('linea')) return <DollarSign className="w-4 h-4" />
    if (key.includes('id') || key.includes('numero')) return <Hash className="w-4 h-4" />
    if (key.includes('campaña') || key.includes('etapa')) return <Tag className="w-4 h-4" />
    if (key.includes('familia') || key.includes('producto')) return <CreditCard className="w-4 h-4" />
    return <Briefcase className="w-4 h-4" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={cn(
          "relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100",
          isHey 
            ? "bg-[#1a1f2e] border border-white/10" 
            : "bg-white border border-orange-100"
        )}
      >
        {/* Header */}
        <div 
          className={cn(
            "px-6 py-4 flex items-center justify-between border-b",
            isHey 
              ? "bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-white/10" 
              : "bg-gradient-to-r from-orange-500 to-orange-400"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isHey ? "bg-white/10" : "bg-white/20"
            )}>
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Detalle de Oferta</h3>
              <p className={cn("text-xs", isHey ? "text-gray-300" : "text-white/80")}>
                {String(data.idOferta || 'Información detallada')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Descripción de Oferta (Full Width) */}
          {typeof data.descripcionOferta === 'string' && (
             <div className={cn(
               "mb-6 p-4 rounded-xl border",
               isHey 
                 ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/10" 
                 : "bg-orange-50 border-orange-100"
             )}>
               <div className="flex items-center gap-2 mb-2">
                 <div className={cn(
                   "p-1.5 rounded-lg",
                   isHey ? "bg-white/10" : "bg-white/50"
                 )}>
                   <Briefcase className="w-4 h-4 text-blue-400" />
                 </div>
                 <h4 className={cn("font-semibold text-sm", isHey ? "text-blue-300" : "text-orange-800")}>
                   Resumen de la Oferta
                 </h4>
               </div>
               <p className={cn(
                 "text-sm whitespace-pre-wrap leading-relaxed",
                 isHey ? "text-gray-300" : "text-gray-700"
               )}>
                 {String(data.descripcionOferta)}
               </p>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => {
              // Omitir campos técnicos o ya mostrados
              if (key === 'id' || key === 'descripcionOferta') return null
              
              return (
                <div 
                  key={key} 
                  className={cn(
                    "p-4 rounded-xl border flex items-start gap-4 transition-all hover:scale-[1.02]",
                    isHey 
                      ? "bg-white/5 border-white/5 hover:bg-white/10" 
                      : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg mt-0.5",
                    isHey 
                      ? "bg-blue-500/20 text-blue-300" 
                      : "bg-orange-100 text-orange-600"
                  )}>
                    {getIcon(key)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-medium mb-1 uppercase tracking-wider",
                      isHey ? "text-gray-400" : "text-gray-500"
                    )}>
                      {getLabel(key)}
                    </p>
                    <p className={cn(
                      "text-sm font-semibold break-words",
                      isHey ? "text-white" : "text-gray-800"
                    )}>
                      {getValue(key, value)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "px-6 py-4 border-t flex justify-end",
          isHey ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"
        )}>
          <button
            onClick={onClose}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95",
              isHey 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500" 
                : "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-400 hover:to-orange-300"
            )}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
