/**
 * Agenda Calendar Component
 * Google Calendar-style with daily, weekly, monthly views
 * Click on events to see popup with details
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, X, MapPin, User, Calendar as CalendarIcon } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

type Vista = 'dia' | 'semana' | 'mes'

interface Evento {
  id: string
  titulo: string
  fecha: Date
  horaInicio: string
  horaFin: string
  tipo: 'reunion' | 'deadline' | 'seguimiento' | 'visita'
  descripcion: string
  cliente?: string
  ubicacion?: string
  color: string
}

// Clientes simulados
const CLIENTES = {
  morales: [
    'Grupo Industrial del Norte S.A. de C.V.',
    'Constructora Metropolitana S. de R.L.',
    'Distribuidora Comercial Azteca S.A.',
    'Inmobiliaria Costa Dorada S.A. de C.V.',
    'Transportes y Logística del Bajío S.A.',
  ],
  fisicas: [
    'Roberto Hernández García',
    'María del Carmen López Ruiz',
    'José Antonio Martínez Flores',
    'Patricia Sánchez Moreno',
    'Carlos Eduardo Ramírez Díaz',
  ]
}

// Eventos de ejemplo - Solo lunes a viernes
// Enero 2026: Día 1=Jueves, 5=Lunes, 6=Martes, 7=Miércoles, 8=Jueves, 9=Viernes
const EVENTOS_EJEMPLO: Evento[] = [
  // Semana 1 (5-9 enero)
  { 
    id: '1', 
    titulo: 'Visita a Grupo Industrial del Norte', 
    fecha: new Date(2026, 0, 5), // Lunes
    horaInicio: '10:00', 
    horaFin: '11:30', 
    tipo: 'visita', 
    descripcion: 'Presentación de productos financieros para expansión de planta',
    cliente: 'Grupo Industrial del Norte S.A. de C.V.',
    ubicacion: 'Oficinas corporativas, Monterrey',
    color: 'bg-blue-500' 
  },
  { 
    id: '2', 
    titulo: 'Seguimiento postventa: Roberto Hernández', 
    fecha: new Date(2026, 0, 6), // Martes
    horaInicio: '09:00', 
    horaFin: '09:30', 
    tipo: 'seguimiento', 
    descripcion: 'Verificar satisfacción con crédito hipotecario otorgado',
    cliente: 'Roberto Hernández García',
    color: 'bg-green-500' 
  },
  { 
    id: '3', 
    titulo: 'Reunión con Constructora Metropolitana', 
    fecha: new Date(2026, 0, 7), // Miércoles
    horaInicio: '11:00', 
    horaFin: '12:30', 
    tipo: 'reunion', 
    descripcion: 'Negociación de línea de crédito para nuevo proyecto habitacional',
    cliente: 'Constructora Metropolitana S. de R.L.',
    ubicacion: 'Sala de juntas principal',
    color: 'bg-purple-500' 
  },
  { 
    id: '4', 
    titulo: 'Junta de equipo comercial', 
    fecha: new Date(2026, 0, 8), // Jueves
    horaInicio: '09:00', 
    horaFin: '10:00', 
    tipo: 'reunion', 
    descripcion: 'Revisión de avances y coordinación del equipo comercial',
    ubicacion: 'Sala de juntas principal',
    color: 'bg-purple-500' 
  },
  { 
    id: '5', 
    titulo: 'Revisión quincenal de resultados', 
    fecha: new Date(2026, 0, 9), // Viernes
    horaInicio: '16:00', 
    horaFin: '17:30', 
    tipo: 'reunion', 
    descripcion: 'Análisis de métricas de ventas y cartera del equipo',
    ubicacion: 'Sala de juntas B',
    color: 'bg-orange-500' 
  },
  
  // Semana 2 (12-16 enero)
  { 
    id: '6', 
    titulo: 'Visita a Distribuidora Comercial Azteca', 
    fecha: new Date(2026, 0, 12), // Lunes
    horaInicio: '09:00', 
    horaFin: '10:30', 
    tipo: 'visita', 
    descripcion: 'Propuesta de financiamiento para inventario',
    cliente: 'Distribuidora Comercial Azteca S.A.',
    ubicacion: 'Bodega central, Tlalnepantla',
    color: 'bg-blue-500' 
  },
  { 
    id: '7', 
    titulo: 'Reunión con José Antonio Martínez', 
    fecha: new Date(2026, 0, 13), // Martes
    horaInicio: '11:00', 
    horaFin: '12:00', 
    tipo: 'reunion', 
    descripcion: 'Presentación de opciones de crédito personal',
    cliente: 'José Antonio Martínez Flores',
    color: 'bg-purple-500' 
  },
  { 
    id: '8', 
    titulo: 'Revisión de cierre de quincena', 
    fecha: new Date(2026, 0, 15), // Jueves (quincena)
    horaInicio: '09:00', 
    horaFin: '11:00', 
    tipo: 'deadline', 
    descripcion: 'Revisión de metas y cierre de operaciones de primera quincena',
    ubicacion: 'Dirección comercial',
    color: 'bg-red-500' 
  },
  { 
    id: '9', 
    titulo: 'Seguimiento postventa: Patricia Sánchez', 
    fecha: new Date(2026, 0, 14), // Miércoles
    horaInicio: '10:00', 
    horaFin: '10:30', 
    tipo: 'seguimiento', 
    descripcion: 'Verificar uso de tarjeta de crédito y ofrecer productos adicionales',
    cliente: 'Patricia Sánchez Moreno',
    color: 'bg-green-500' 
  },
  { 
    id: '10', 
    titulo: 'Visita a Inmobiliaria Costa Dorada', 
    fecha: new Date(2026, 0, 16), // Viernes
    horaInicio: '10:00', 
    horaFin: '12:00', 
    tipo: 'visita', 
    descripcion: 'Tour de desarrollos y análisis de oportunidades de financiamiento',
    cliente: 'Inmobiliaria Costa Dorada S.A. de C.V.',
    ubicacion: 'Desarrollo Playa del Carmen',
    color: 'bg-blue-500' 
  },
  
  // Semana 3 (19-23 enero)
  { 
    id: '11', 
    titulo: 'Reunión con Transportes del Bajío', 
    fecha: new Date(2026, 0, 19), // Lunes
    horaInicio: '10:00', 
    horaFin: '11:30', 
    tipo: 'reunion', 
    descripcion: 'Renovación de línea de crédito para flotilla vehicular',
    cliente: 'Transportes y Logística del Bajío S.A.',
    ubicacion: 'Oficinas León, Gto.',
    color: 'bg-purple-500' 
  },
  { 
    id: '12', 
    titulo: 'Seguimiento postventa: Carlos Ramírez', 
    fecha: new Date(2026, 0, 20), // Martes
    horaInicio: '09:30', 
    horaFin: '10:00', 
    tipo: 'seguimiento', 
    descripcion: 'Revisión de historial crediticio y oportunidades de mejora',
    cliente: 'Carlos Eduardo Ramírez Díaz',
    color: 'bg-green-500' 
  },
  { 
    id: '13', 
    titulo: 'Revisión quincenal de resultados', 
    fecha: new Date(2026, 0, 23), // Viernes
    horaInicio: '16:00', 
    horaFin: '17:30', 
    tipo: 'reunion', 
    descripcion: 'Análisis de avance mensual y proyección de cierre',
    ubicacion: 'Sala de juntas B',
    color: 'bg-orange-500' 
  },
  
  // Cierre de mes (30 enero = viernes)
  { 
    id: '14', 
    titulo: 'Revisión de cierre de mes', 
    fecha: new Date(2026, 0, 30), // Viernes 30
    horaInicio: '09:00', 
    horaFin: '12:00', 
    tipo: 'deadline', 
    descripcion: 'Cierre definitivo de operaciones de enero, revisión de comisiones',
    ubicacion: 'Dirección comercial',
    color: 'bg-red-600' 
  },
]

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Componente Popup de Evento
function EventoPopup({ 
  evento, 
  onClose,
  isHey 
}: { 
  evento: Evento
  onClose: () => void
  isHey: boolean 
}) {
  const tipoLabel = {
    reunion: '📅 Reunión',
    deadline: '⚠️ Fecha límite',
    seguimiento: '📞 Seguimiento',
    visita: '🚗 Visita'
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className={cn(
          "w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden",
          isHey ? "bg-[#1f2537]" : "bg-white"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con color */}
        <div className={cn("p-4", evento.color)}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-white/80 text-sm">{tipoLabel[evento.tipo]}</span>
              <h3 className="text-white font-bold text-lg mt-1">{evento.titulo}</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Fecha y hora */}
          <div className="flex items-center gap-3">
            <CalendarIcon className={cn("w-5 h-5", isHey ? "text-cyan-400" : "text-orange-500")} />
            <div>
              <p className={cn("font-medium", isHey ? "text-white" : "text-gray-800")}>
                {evento.fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className={cn("text-sm", isHey ? "text-gray-400" : "text-gray-500")}>
                {evento.horaInicio} - {evento.horaFin}
              </p>
            </div>
          </div>
          
          {/* Cliente */}
          {evento.cliente && (
            <div className="flex items-center gap-3">
              <User className={cn("w-5 h-5", isHey ? "text-cyan-400" : "text-orange-500")} />
              <p className={cn(isHey ? "text-white" : "text-gray-800")}>
                {evento.cliente}
              </p>
            </div>
          )}
          
          {/* Ubicación */}
          {evento.ubicacion && (
            <div className="flex items-center gap-3">
              <MapPin className={cn("w-5 h-5", isHey ? "text-cyan-400" : "text-orange-500")} />
              <p className={cn(isHey ? "text-white" : "text-gray-800")}>
                {evento.ubicacion}
              </p>
            </div>
          )}
          
          {/* Descripción */}
          <div className={cn(
            "p-3 rounded-lg",
            isHey ? "bg-white/5" : "bg-gray-50"
          )}>
            <p className={cn("text-sm", isHey ? "text-gray-300" : "text-gray-600")}>
              {evento.descripcion}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AgendaCalendar() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  
  const [vista, setVista] = useState<Vista>('semana')
  const [fechaActual, setFechaActual] = useState(new Date(2026, 0, 7)) // 7 de enero 2026
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null)
  
  // Obtener eventos del día
  const getEventosDelDia = (fecha: Date) => {
    return EVENTOS_EJEMPLO.filter(e => 
      e.fecha.getFullYear() === fecha.getFullYear() &&
      e.fecha.getMonth() === fecha.getMonth() &&
      e.fecha.getDate() === fecha.getDate()
    )
  }
  
  // Navegación
  const navegar = (direccion: number) => {
    const nueva = new Date(fechaActual)
    if (vista === 'dia') nueva.setDate(nueva.getDate() + direccion)
    else if (vista === 'semana') nueva.setDate(nueva.getDate() + (direccion * 7))
    else nueva.setMonth(nueva.getMonth() + direccion)
    setFechaActual(nueva)
  }
  
  // Obtener días de la semana actual (Lunes a Viernes)
  const getDiasSemana = () => {
    const dias = []
    const inicio = new Date(fechaActual)
    inicio.setDate(inicio.getDate() - inicio.getDay())
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio)
      dia.setDate(inicio.getDate() + i)
      dias.push(dia)
    }
    return dias
  }
  
  // Obtener días del mes
  const getDiasMes = () => {
    const año = fechaActual.getFullYear()
    const mes = fechaActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    
    const dias = []
    
    // Días del mes anterior para completar la primera semana
    for (let i = 0; i < primerDia.getDay(); i++) {
      const d = new Date(año, mes, -i)
      dias.unshift({ fecha: d, otroMes: true })
    }
    
    // Días del mes
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push({ fecha: new Date(año, mes, i), otroMes: false })
    }
    
    // Días del siguiente mes para completar
    const restantes = 42 - dias.length
    for (let i = 1; i <= restantes; i++) {
      dias.push({ fecha: new Date(año, mes + 1, i), otroMes: true })
    }
    
    return dias
  }
  
  const esHoy = (fecha: Date) => {
    const hoy = new Date()
    return fecha.getDate() === hoy.getDate() && 
           fecha.getMonth() === hoy.getMonth() && 
           fecha.getFullYear() === hoy.getFullYear()
  }
  
  const esFinDeSemana = (fecha: Date) => {
    const dia = fecha.getDay()
    return dia === 0 || dia === 6
  }
  
  return (
    <div className="space-y-4">
      {/* Popup de evento */}
      {eventoSeleccionado && (
        <EventoPopup 
          evento={eventoSeleccionado} 
          onClose={() => setEventoSeleccionado(null)}
          isHey={isHey}
        />
      )}
      
      {/* Header con navegación y vista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navegar(-1)}
            className={cn(
              "p-1 rounded-lg transition-colors",
              isHey ? "hover:bg-white/10" : "hover:bg-orange-100"
            )}
          >
            <ChevronLeft className={cn("w-5 h-5", isHey ? "text-gray-400" : "text-gray-600")} />
          </button>
          <span className={cn("font-semibold min-w-[200px] text-center", isHey ? "text-white" : "text-gray-800")}>
            {vista === 'dia' && fechaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
            {vista === 'semana' && (() => {
              const dias = getDiasSemana()
              return `Semana del ${dias[0]?.getDate() ?? ''} - ${dias[6]?.getDate() ?? ''} ${MESES[fechaActual.getMonth()]}`
            })()}
            {vista === 'mes' && `${MESES[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`}
          </span>
          <button
            onClick={() => navegar(1)}
            className={cn(
              "p-1 rounded-lg transition-colors",
              isHey ? "hover:bg-white/10" : "hover:bg-orange-100"
            )}
          >
            <ChevronRight className={cn("w-5 h-5", isHey ? "text-gray-400" : "text-gray-600")} />
          </button>
        </div>
        
        {/* Toggle de vista */}
        <div className={cn(
          "flex rounded-lg p-1",
          isHey ? "bg-white/5" : "bg-orange-100"
        )}>
          {(['dia', 'semana', 'mes'] as Vista[]).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={cn(
                "px-3 py-1 text-sm rounded-md transition-all",
                vista === v
                  ? isHey
                    ? "bg-cyan-500 text-white"
                    : "bg-orange-500 text-white"
                  : isHey
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-800"
              )}
            >
              {v === 'dia' ? 'Día' : v === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Vista Diaria */}
      {vista === 'dia' && (
        <div className="space-y-2">
          {getEventosDelDia(fechaActual).length === 0 ? (
            <p className={cn("text-sm text-center py-8", isHey ? "text-gray-500" : "text-gray-400")}>
              {esFinDeSemana(fechaActual) ? 'Fin de semana - No hay eventos programados' : 'No hay eventos para este día'}
            </p>
          ) : (
            getEventosDelDia(fechaActual).map(evento => (
              <div 
                key={evento.id}
                onClick={() => setEventoSeleccionado(evento)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-transform hover:scale-[1.02]",
                  isHey ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                <div className={cn("w-1 h-12 rounded-full", evento.color)} />
                <div className="flex-1">
                  <p className={cn("font-medium", isHey ? "text-white" : "text-gray-800")}>
                    {evento.titulo}
                  </p>
                  <p className={cn("text-sm flex items-center gap-1", isHey ? "text-gray-400" : "text-gray-500")}>
                    <Clock className="w-3 h-3" />
                    {evento.horaInicio} - {evento.horaFin}
                    {evento.cliente && <span className="ml-2">• {evento.cliente}</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Vista Semanal */}
      {vista === 'semana' && (
        <div className="grid grid-cols-7 gap-1">
          {/* Headers de días */}
          {getDiasSemana().map((dia, i) => (
            <div 
              key={i}
              className={cn(
                "text-center py-2 rounded-lg",
                esFinDeSemana(dia) 
                  ? isHey ? "bg-white/2 opacity-50" : "bg-gray-100 opacity-50"
                  : esHoy(dia) 
                    ? isHey ? "bg-cyan-500/20" : "bg-orange-100"
                    : ""
              )}
            >
              <p className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-500")}>
                {DIAS_SEMANA[i]}
              </p>
              <p className={cn(
                "text-lg font-bold",
                esHoy(dia)
                  ? isHey ? "text-cyan-400" : "text-orange-500"
                  : isHey ? "text-white" : "text-gray-800"
              )}>
                {dia.getDate()}
              </p>
            </div>
          ))}
          
          {/* Eventos de cada día */}
          {getDiasSemana().map((dia, i) => (
            <div 
              key={`eventos-${i}`} 
              className={cn(
                "min-h-[100px] space-y-1",
                esFinDeSemana(dia) && "opacity-30"
              )}
            >
              {getEventosDelDia(dia).slice(0, 3).map(evento => (
                <div 
                  key={evento.id}
                  onClick={() => setEventoSeleccionado(evento)}
                  className={cn(
                    "text-xs p-1 rounded truncate cursor-pointer transition-all hover:opacity-80",
                    evento.color,
                    "text-white"
                  )}
                  title={`${evento.titulo} - ${evento.horaInicio}`}
                >
                  {evento.horaInicio} {evento.titulo}
                </div>
              ))}
              {getEventosDelDia(dia).length > 3 && (
                <p className={cn("text-xs text-center", isHey ? "text-gray-500" : "text-gray-400")}>
                  +{getEventosDelDia(dia).length - 3} más
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Vista Mensual */}
      {vista === 'mes' && (
        <div>
          {/* Headers de días */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS_SEMANA.map((dia, i) => (
              <div 
                key={dia} 
                className={cn(
                  "text-center py-1 text-xs font-medium", 
                  (i === 0 || i === 6) ? "opacity-50" : "",
                  isHey ? "text-gray-500" : "text-gray-500"
                )}
              >
                {dia}
              </div>
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {getDiasMes().map(({ fecha, otroMes }, i) => (
              <div 
                key={i}
                className={cn(
                  "min-h-[70px] p-1 rounded-lg text-xs",
                  esFinDeSemana(fecha) 
                    ? isHey ? "bg-white/2 opacity-40" : "bg-gray-100 opacity-40"
                    : otroMes 
                      ? isHey ? "bg-white/2 text-gray-600" : "bg-gray-50 text-gray-300"
                      : isHey ? "bg-white/5" : "bg-white border border-orange-100",
                  esHoy(fecha) && !otroMes && (isHey ? "ring-2 ring-cyan-500" : "ring-2 ring-orange-500")
                )}
              >
                <span className={cn(
                  "font-medium",
                  esHoy(fecha) && !otroMes
                    ? isHey ? "text-cyan-400" : "text-orange-500"
                    : otroMes
                      ? isHey ? "text-gray-600" : "text-gray-300"
                      : isHey ? "text-white" : "text-gray-800"
                )}>
                  {fecha.getDate()}
                </span>
                <div className="mt-1 space-y-0.5">
                  {getEventosDelDia(fecha).slice(0, 2).map(evento => (
                    <div 
                      key={evento.id}
                      onClick={() => setEventoSeleccionado(evento)}
                      className={cn(
                        "truncate rounded px-1 cursor-pointer hover:opacity-80", 
                        evento.color, 
                        "text-white text-[10px]"
                      )}
                    >
                      {evento.titulo}
                    </div>
                  ))}
                  {getEventosDelDia(fecha).length > 2 && (
                    <p className="text-[10px] text-center opacity-60">
                      +{getEventosDelDia(fecha).length - 2}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
