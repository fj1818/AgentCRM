import { useEffect, useState } from 'react'
import { X, User, Phone, Mail, MapPin, Calendar, Hash, Building } from 'lucide-react'
import { cn } from '@/utils'
import { useUIStore } from '@/stores'
import { obtenerDetalleCliente } from '@/services/sqlDatabaseService'

interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  ide: string | null
}

export function ClientDetailsModal({ isOpen, onClose, ide }: ClientDetailsModalProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && ide) {
      setLoading(true)
      obtenerDetalleCliente(ide)
        .then(details => {
          setData(details)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    } else {
      setData(null)
    }
  }, [isOpen, ide])

  if (!isOpen) return null

  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      ide: 'ID Cliente',
      rfc: 'RFC',
      nombre: 'Nombre / Razón Social',
      fechaAlta: 'Fecha de Alta',
      fechaBaja: 'Fecha de Baja',
      tipoPersona: 'Tipo de Persona',
      numeroPromotor: 'Promotor Asignado',
      telefonos: 'Teléfonos',
      correos: 'Correos Electrónicos',
      calle: 'Calle',
      numero: 'Número',
      cp: 'Código Postal',
      colonia: 'Colonia',
      municipio: 'Municipio',
      estado: 'Estado'
    }
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  }

  const getIcon = (key: string) => {
    if (key.includes('fecha')) return <Calendar className="w-4 h-4" />
    if (key.includes('telefono')) return <Phone className="w-4 h-4" />
    if (key.includes('correo')) return <Mail className="w-4 h-4" />
    if (key.includes('calle') || key.includes('colonia') || key.includes('municipio') || key.includes('estado') || key.includes('cp')) return <MapPin className="w-4 h-4" />
    if (key.includes('ide') || key.includes('rfc')) return <Hash className="w-4 h-4" />
    if (key.includes('tipo')) return <Building className="w-4 h-4" />
    return <User className="w-4 h-4" />
  }

  const formatValue = (_key: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return '-'
    if (Array.isArray(value)) return value.join(', ')
    return String(value)
  }

  // Agrupar datos para mostrar
  const basicInfo = data ? {
    ide: data.ide,
    rfc: data.rfc,
    nombre: data.nombre,
    tipoPersona: data.tipoPersona,
    fechaAlta: data.fechaAlta,
    numeroPromotor: data.numeroPromotor
  } : {}

  const contactInfo = data ? {
    telefonos: data.telefonos,
    correos: data.correos
  } : {}

  const addressInfo = data ? {
    calle: data.calle,
    numero: data.numero,
    colonia: data.colonia,
    municipio: data.municipio,
    estado: data.estado,
    cp: data.cp
  } : {}

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop con Blur intenso */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className={cn(
          "relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100",
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
              ? "bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-white/10" 
              : "bg-gradient-to-r from-orange-500 to-orange-400"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isHey ? "bg-white/10" : "bg-white/20"
            )}>
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {loading ? 'Cargando...' : (data?.nombre as string || 'Detalle del Cliente')}
              </h3>
              <p className={cn("text-xs", isHey ? "text-cyan-200" : "text-white/90")}>
                {ide}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current text-cyan-500"></div>
            </div>
          ) : data ? (
            <>
              {/* Información Básica */}
              <section>
                <h4 className={cn("text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2", isHey ? "text-cyan-400" : "text-orange-600")}>
                  <User className="w-4 h-4" /> Información General
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(basicInfo).map(([key, value]) => (
                    <InfoCard key={key} label={getLabel(key)} value={formatValue(key, value)} icon={getIcon(key)} isHey={isHey} />
                  ))}
                </div>
              </section>

              {/* Contacto */}
              <section>
                <h4 className={cn("text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2", isHey ? "text-cyan-400" : "text-orange-600")}>
                  <Phone className="w-4 h-4" /> Contacto
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(contactInfo).map(([key, value]) => (
                    <InfoCard key={key} label={getLabel(key)} value={formatValue(key, value)} icon={getIcon(key)} isHey={isHey} />
                  ))}
                </div>
              </section>

              {/* Dirección */}
              <section>
                <h4 className={cn("text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2", isHey ? "text-cyan-400" : "text-orange-600")}>
                  <MapPin className="w-4 h-4" /> Dirección
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(addressInfo).map(([key, value]) => (
                    <InfoCard key={key} label={getLabel(key)} value={formatValue(key, value)} icon={getIcon(key)} isHey={isHey} />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">No se encontró información del cliente.</div>
          )}
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
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500" 
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

function InfoCard({ label, value, icon, isHey }: { label: string, value: string, icon: React.ReactNode, isHey: boolean }) {
  return (
    <div 
      className={cn(
        "p-3 rounded-xl border flex items-start gap-3 transition-all hover:scale-[1.02]",
        isHey 
          ? "bg-white/5 border-white/5 hover:bg-white/10" 
          : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg mt-0.5",
        isHey 
          ? "bg-cyan-500/20 text-cyan-300" 
          : "bg-orange-100 text-orange-600"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[10px] font-bold mb-0.5 uppercase tracking-wider",
          isHey ? "text-gray-400" : "text-gray-500"
        )}>
          {label}
        </p>
        <p className={cn(
          "text-sm font-medium break-words",
          isHey ? "text-white" : "text-gray-800"
        )}>
          {value}
        </p>
      </div>
    </div>
  )
}
