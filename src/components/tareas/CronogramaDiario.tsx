/**
 * Cronograma Diario - Vista de horarios del día
 * Muestra actividades en bloques de tiempo de 9:00 a 18:00
 */

import { useState, useEffect } from 'react'
import { Clock, Phone, FileText, Users, Coffee, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'

interface Actividad {
  id: string
  titulo: string
  horaInicio: string
  duracion: number // en minutos
  tipo: 'llamada' | 'reunion' | 'expediente' | 'prospeccion' | 'folios' | 'comida' | 'otro'
  cliente?: string
  completada: boolean
  color: string
}

// Función para generar key de fecha
const getFechaKey = (fecha: Date) => {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

// Actividades por día - Semana 1 (5-9 enero) y Semana 2 (12-16 enero)
const ACTIVIDADES_POR_DIA: Record<string, Actividad[]> = {
  // SEMANA 1
  // Lunes 5 enero
  '2026-01-05': [
    { id: '1', titulo: 'Planeación semanal y revisión de metas', horaInicio: '09:00', duracion: 60, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
    { id: '2', titulo: 'Llamada con Grupo Financiero Azteca', horaInicio: '10:00', duracion: 45, tipo: 'llamada', cliente: 'Grupo Financiero Azteca S.A.', completada: false, color: 'bg-green-500' },
    { id: '3', titulo: 'Completar expediente cliente nuevo', horaInicio: '11:00', duracion: 60, tipo: 'expediente', cliente: 'Fernando Reyes Herrera', completada: false, color: 'bg-blue-500' },
    { id: '4', titulo: 'Prospectar clientes zona centro', horaInicio: '12:00', duracion: 60, tipo: 'prospeccion', completada: false, color: 'bg-cyan-500' },
    { id: '5', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '6', titulo: 'Seguimiento cartera vencida', horaInicio: '15:00', duracion: 45, tipo: 'llamada', completada: false, color: 'bg-green-500' },
    { id: '7', titulo: 'Actualizar CRM con prospectos', horaInicio: '16:00', duracion: 60, tipo: 'otro', completada: false, color: 'bg-gray-400' },
  ],
  // Martes 6 enero
  '2026-01-06': [
    { id: '1', titulo: 'Revisar correos y pendientes', horaInicio: '09:00', duracion: 30, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '2', titulo: 'Llamada con Carlos Mendoza', horaInicio: '09:30', duracion: 30, tipo: 'llamada', cliente: 'Carlos Mendoza Ruiz', completada: false, color: 'bg-green-500' },
    { id: '3', titulo: 'Visita a Inmobiliaria del Valle', horaInicio: '10:30', duracion: 90, tipo: 'reunion', cliente: 'Inmobiliaria del Valle S.A.', completada: false, color: 'bg-purple-500' },
    { id: '4', titulo: 'Avanzar folios de PIC', horaInicio: '12:30', duracion: 30, tipo: 'folios', completada: false, color: 'bg-amber-500' },
    { id: '5', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '6', titulo: 'Completar expediente hipotecario', horaInicio: '15:00', duracion: 60, tipo: 'expediente', cliente: 'Ana María Gutiérrez', completada: false, color: 'bg-blue-500' },
    { id: '7', titulo: 'Capacitación productos nuevos', horaInicio: '16:30', duracion: 60, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
  ],
  // Miércoles 7 enero (HOY)
  '2026-01-07': [
    { id: '1', titulo: 'Revisar correos y pendientes del día', horaInicio: '09:00', duracion: 30, tipo: 'otro', completada: true, color: 'bg-gray-400' },
    { id: '2', titulo: 'Llamada con Roberto Hernández', horaInicio: '09:30', duracion: 30, tipo: 'llamada', cliente: 'Roberto Hernández García', completada: true, color: 'bg-green-500' },
    { id: '3', titulo: 'Completar expediente Grupo Industrial', horaInicio: '10:00', duracion: 45, tipo: 'expediente', cliente: 'Grupo Industrial del Norte S.A.', completada: false, color: 'bg-blue-500' },
    { id: '4', titulo: 'Reunión con Constructora Metropolitana', horaInicio: '11:00', duracion: 60, tipo: 'reunion', cliente: 'Constructora Metropolitana S. de R.L.', completada: false, color: 'bg-purple-500' },
    { id: '5', titulo: 'Avanzar folios de PIC', horaInicio: '12:00', duracion: 30, tipo: 'folios', completada: false, color: 'bg-amber-500' },
    { id: '6', titulo: 'Llamada seguimiento María del Carmen', horaInicio: '12:30', duracion: 15, tipo: 'llamada', cliente: 'María del Carmen López', completada: false, color: 'bg-green-500' },
    { id: '7', titulo: 'Actualizar CRM con notas de reunión', horaInicio: '12:45', duracion: 15, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '8', titulo: 'Prospectar nuevos clientes (zona norte)', horaInicio: '13:00', duracion: 60, tipo: 'prospeccion', completada: false, color: 'bg-cyan-500' },
    { id: '9', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '10', titulo: 'Completar expediente José Antonio', horaInicio: '15:00', duracion: 45, tipo: 'expediente', cliente: 'José Antonio Martínez Flores', completada: false, color: 'bg-blue-500' },
    { id: '11', titulo: 'Enviar cotización a Patricia Sánchez', horaInicio: '15:45', duracion: 15, tipo: 'otro', cliente: 'Patricia Sánchez Moreno', completada: false, color: 'bg-gray-400' },
    { id: '12', titulo: 'Revisión quincenal de resultados', horaInicio: '16:00', duracion: 90, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
  ],
  // Jueves 8 enero
  '2026-01-08': [
    { id: '1', titulo: 'Junta de equipo comercial', horaInicio: '09:00', duracion: 60, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
    { id: '2', titulo: 'Llamada con Distribuidora Nacional', horaInicio: '10:00', duracion: 30, tipo: 'llamada', cliente: 'Distribuidora Nacional S.A.', completada: false, color: 'bg-green-500' },
    { id: '3', titulo: 'Visita a cliente potencial', horaInicio: '10:30', duracion: 90, tipo: 'reunion', cliente: 'Textiles Monterrey S.A. de C.V.', completada: false, color: 'bg-purple-500' },
    { id: '4', titulo: 'Almuerzo con prospecto', horaInicio: '12:30', duracion: 90, tipo: 'reunion', cliente: 'Ricardo Salazar Torres', completada: false, color: 'bg-purple-500' },
    { id: '5', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '6', titulo: 'Seguimiento postventa clientes Q4', horaInicio: '15:00', duracion: 60, tipo: 'llamada', completada: false, color: 'bg-green-500' },
    { id: '7', titulo: 'Preparar presentación para viernes', horaInicio: '16:30', duracion: 60, tipo: 'otro', completada: false, color: 'bg-gray-400' },
  ],
  // Viernes 9 enero
  '2026-01-09': [
    { id: '1', titulo: 'Revisar avance semanal', horaInicio: '09:00', duracion: 45, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '2', titulo: 'Presentación a Dirección', horaInicio: '10:00', duracion: 60, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
    { id: '3', titulo: 'Cierre de expedientes pendientes', horaInicio: '11:00', duracion: 60, tipo: 'expediente', completada: false, color: 'bg-blue-500' },
    { id: '4', titulo: 'Llamadas de cierre de semana', horaInicio: '12:00', duracion: 60, tipo: 'llamada', completada: false, color: 'bg-green-500' },
    { id: '5', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '6', titulo: 'Actualizar pipeline en CRM', horaInicio: '15:00', duracion: 45, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '7', titulo: 'Planeación próxima semana', horaInicio: '16:00', duracion: 60, tipo: 'otro', completada: false, color: 'bg-gray-400' },
  ],
  
  // SEMANA 2
  // Lunes 12 enero
  '2026-01-12': [
    { id: '1', titulo: 'Kick-off semanal con equipo', horaInicio: '09:00', duracion: 60, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
    { id: '2', titulo: 'Llamada con Transportes del Bajío', horaInicio: '10:00', duracion: 45, tipo: 'llamada', cliente: 'Transportes y Logística del Bajío S.A.', completada: false, color: 'bg-green-500' },
    { id: '3', titulo: 'Completar expediente crédito auto', horaInicio: '11:00', duracion: 60, tipo: 'expediente', cliente: 'Martín Ochoa Valdez', completada: false, color: 'bg-blue-500' },
    { id: '4', titulo: 'Avanzar folios de PIC', horaInicio: '12:00', duracion: 45, tipo: 'folios', completada: false, color: 'bg-amber-500' },
    { id: '5', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '6', titulo: 'Prospectar zona industrial', horaInicio: '15:00', duracion: 90, tipo: 'prospeccion', completada: false, color: 'bg-cyan-500' },
    { id: '7', titulo: 'Reporte de actividades', horaInicio: '17:00', duracion: 30, tipo: 'otro', completada: false, color: 'bg-gray-400' },
  ],
  // Martes 13 enero
  '2026-01-13': [
    { id: '1', titulo: 'Seguimiento leads de la semana pasada', horaInicio: '09:00', duracion: 60, tipo: 'llamada', completada: false, color: 'bg-green-500' },
    { id: '2', titulo: 'Reunión con Farmacéutica del Norte', horaInicio: '10:00', duracion: 90, tipo: 'reunion', cliente: 'Farmacéutica del Norte S.A.', completada: false, color: 'bg-purple-500' },
    { id: '3', titulo: 'Completar expediente línea de crédito', horaInicio: '11:30', duracion: 45, tipo: 'expediente', cliente: 'Alimentos Procesados MX', completada: false, color: 'bg-blue-500' },
    { id: '4', titulo: 'Actualizar forecast Q1', horaInicio: '12:30', duracion: 30, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '5', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '6', titulo: 'Visita a sucursal cliente', horaInicio: '15:00', duracion: 90, tipo: 'reunion', cliente: 'Comercializadora Global S.A.', completada: false, color: 'bg-purple-500' },
    { id: '7', titulo: 'Documentar visita en CRM', horaInicio: '17:00', duracion: 30, tipo: 'otro', completada: false, color: 'bg-gray-400' },
  ],
  // Miércoles 14 enero
  '2026-01-14': [
    { id: '1', titulo: 'Revisar correos prioritarios', horaInicio: '09:00', duracion: 30, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '2', titulo: 'Capacitación nuevos productos', horaInicio: '09:30', duracion: 90, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
    { id: '3', titulo: 'Llamada con Patricia Sánchez', horaInicio: '11:00', duracion: 30, tipo: 'llamada', cliente: 'Patricia Sánchez Moreno', completada: false, color: 'bg-green-500' },
    { id: '4', titulo: 'Avanzar folios de PIC', horaInicio: '11:30', duracion: 45, tipo: 'folios', completada: false, color: 'bg-amber-500' },
    { id: '5', titulo: 'Prospectar clientes referidos', horaInicio: '12:30', duracion: 30, tipo: 'prospeccion', completada: false, color: 'bg-cyan-500' },
    { id: '6', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '7', titulo: 'Completar expediente PYME', horaInicio: '15:00', duracion: 60, tipo: 'expediente', cliente: 'Servicios Técnicos del Norte', completada: false, color: 'bg-blue-500' },
    { id: '8', titulo: 'Seguimiento cotizaciones enviadas', horaInicio: '16:00', duracion: 60, tipo: 'llamada', completada: false, color: 'bg-green-500' },
  ],
  // Jueves 15 enero (Quincena)
  '2026-01-15': [
    { id: '1', titulo: 'Revisión de cierre de quincena', horaInicio: '09:00', duracion: 90, tipo: 'reunion', completada: false, color: 'bg-red-500' },
    { id: '2', titulo: 'Cierre de operaciones pendientes', horaInicio: '10:30', duracion: 60, tipo: 'expediente', completada: false, color: 'bg-blue-500' },
    { id: '3', titulo: 'Llamadas de cobranza suave', horaInicio: '11:30', duracion: 30, tipo: 'llamada', completada: false, color: 'bg-green-500' },
    { id: '4', titulo: 'Reporte quincenal de comisiones', horaInicio: '12:00', duracion: 60, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '5', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '6', titulo: 'Junta con gerencia comercial', horaInicio: '15:00', duracion: 90, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
    { id: '7', titulo: 'Planear estrategia segunda quincena', horaInicio: '17:00', duracion: 45, tipo: 'otro', completada: false, color: 'bg-gray-400' },
  ],
  // Viernes 16 enero
  '2026-01-16': [
    { id: '1', titulo: 'One-on-one con supervisor', horaInicio: '09:00', duracion: 45, tipo: 'reunion', completada: false, color: 'bg-purple-500' },
    { id: '2', titulo: 'Visita a Inmobiliaria Costa Dorada', horaInicio: '10:00', duracion: 120, tipo: 'reunion', cliente: 'Inmobiliaria Costa Dorada S.A. de C.V.', completada: false, color: 'bg-purple-500' },
    { id: '3', titulo: 'Avanzar folios de PIC', horaInicio: '12:00', duracion: 30, tipo: 'folios', completada: false, color: 'bg-amber-500' },
    { id: '4', titulo: 'Hora de comida', horaInicio: '14:00', duracion: 60, tipo: 'comida', completada: false, color: 'bg-orange-400' },
    { id: '5', titulo: 'Cierre de expedientes de la semana', horaInicio: '15:00', duracion: 60, tipo: 'expediente', completada: false, color: 'bg-blue-500' },
    { id: '6', titulo: 'Actualizar pipeline y forecast', horaInicio: '16:00', duracion: 45, tipo: 'otro', completada: false, color: 'bg-gray-400' },
    { id: '7', titulo: 'Planeación próxima semana', horaInicio: '17:00', duracion: 30, tipo: 'otro', completada: false, color: 'bg-gray-400' },
  ],
}

const HORAS = [
  { inicio: '09:00', fin: '10:00', label: '9:00 AM' },
  { inicio: '10:00', fin: '11:00', label: '10:00 AM' },
  { inicio: '11:00', fin: '12:00', label: '11:00 AM' },
  { inicio: '12:00', fin: '13:00', label: '12:00 PM' },
  { inicio: '13:00', fin: '14:00', label: '1:00 PM' },
  { inicio: '14:00', fin: '15:00', label: '2:00 PM' },
  { inicio: '15:00', fin: '16:00', label: '3:00 PM' },
  { inicio: '16:00', fin: '17:00', label: '4:00 PM' },
  { inicio: '17:00', fin: '18:00', label: '5:00 PM' },
]

const ICONOS_TIPO = {
  llamada: Phone,
  reunion: Users,
  expediente: FileText,
  prospeccion: Users,
  folios: FileText,
  comida: Coffee,
  otro: Clock,
}

// Función para saltar fines de semana
const saltarFinDeSemana = (fecha: Date, direccion: number): Date => {
  const nueva = new Date(fecha)
  nueva.setDate(nueva.getDate() + direccion)
  
  // Si cae en sábado (6), mover al lunes
  if (nueva.getDay() === 6) {
    nueva.setDate(nueva.getDate() + (direccion > 0 ? 2 : -1))
  }
  // Si cae en domingo (0), mover al lunes o viernes
  if (nueva.getDay() === 0) {
    nueva.setDate(nueva.getDate() + (direccion > 0 ? 1 : -2))
  }
  return nueva
}

export function CronogramaDiario() {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [fechaActual, setFechaActual] = useState(new Date(2026, 0, 7))
  const [actividades, setActividades] = useState<Actividad[]>([])
  
  // Cargar actividades cuando cambia la fecha
  useEffect(() => {
    const key = getFechaKey(fechaActual)
    const actividadesDia = ACTIVIDADES_POR_DIA[key] || []
    // Crear copia para no mutar el original
    setActividades(actividadesDia.map(a => ({ ...a })))
  }, [fechaActual])
  
  const toggleActividad = (id: string) => {
    setActividades(prev => prev.map(a => 
      a.id === id ? { ...a, completada: !a.completada } : a
    ))
  }
  
  const getActividadesEnHora = (horaInicio: string) => {
    return actividades.filter(a => {
      const actParts = a.horaInicio.split(':')
      const bloqueParts = horaInicio.split(':')
      const horaAct = parseInt(actParts[0] || '0')
      const horaBloque = parseInt(bloqueParts[0] || '0')
      return horaAct >= horaBloque && horaAct < horaBloque + 1
    })
  }
  
  const navegar = (dias: number) => {
    setFechaActual(prev => saltarFinDeSemana(prev, dias))
  }
  // Cálculos de tiempo
  const TIEMPO_TOTAL = 540 // 9 horas de 9am a 6pm = 540 minutos
  const tiempoAsignado = actividades.reduce((acc, a) => acc + a.duracion, 0)
  const tiempoCompletado = actividades.filter(a => a.completada).reduce((acc, a) => acc + a.duracion, 0)
  const tiempoSinAsignar = Math.max(0, TIEMPO_TOTAL - tiempoAsignado)
  const porcentajeCompletado = tiempoAsignado > 0 ? Math.round((tiempoCompletado / tiempoAsignado) * 100) : 0
  
  return (
    <div className="space-y-4">
      {/* Barra de progreso de tiempo */}
      <div className={cn(
        "p-4 rounded-xl",
        isHey ? "bg-white/5" : "bg-orange-50"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-sm font-medium", isHey ? "text-white" : "text-gray-700")}>
            Tiempo asignado
          </span>
          <div className="flex items-center gap-3">
            <span className={cn("text-sm font-semibold", isHey ? "text-cyan-400" : "text-orange-600")}>
              {tiempoAsignado} min de {TIEMPO_TOTAL} min
            </span>
            {tiempoSinAsignar > 0 && (
              <span className={cn("text-sm font-medium", isHey ? "text-green-400" : "text-green-600")}>
                ({tiempoSinAsignar} min disponibles)
              </span>
            )}
            {tiempoAsignado > TIEMPO_TOTAL && (
              <span className="text-sm font-medium text-yellow-500">
                (+{tiempoAsignado - TIEMPO_TOTAL} min extra)
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "h-3 rounded-full overflow-hidden",
          isHey ? "bg-white/10" : "bg-gray-200"
        )}>
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isHey ? "bg-gradient-to-r from-cyan-500 to-cyan-400" : "bg-gradient-to-r from-orange-500 to-orange-400"
            )}
            style={{ width: `${porcentajeCompletado}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className={cn("text-xs", isHey ? "text-gray-400" : "text-gray-500")}>
            <span className={cn("font-medium", isHey ? "text-green-400" : "text-green-600")}>
              {tiempoCompletado} min completados
            </span>
            <span className="mx-2">•</span>
            <span>{porcentajeCompletado}% de tareas completadas</span>
          </div>
          <span className={cn("text-xs", isHey ? "text-gray-500" : "text-gray-400")}>
            Jornada: 9:00 - 18:00
          </span>
        </div>
      </div>
      
      {/* Header con fecha */}
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
          <h3 className={cn("font-semibold min-w-[200px] text-center", isHey ? "text-white" : "text-gray-800")}>
            {fechaActual.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
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
      </div>
      
      {/* Timeline */}
      <div className="space-y-1">
        {HORAS.map((hora) => {
          const actividadesHora = getActividadesEnHora(hora.inicio)
          const esComida = hora.inicio === '14:00'
          
          return (
            <div 
              key={hora.inicio}
              className={cn(
                "flex gap-3 min-h-[60px]",
                esComida && (isHey ? "bg-orange-500/10" : "bg-orange-50")
              )}
            >
              {/* Columna de hora */}
              <div className={cn(
                "w-16 py-2 text-right pr-2 text-sm font-medium shrink-0 border-r",
                isHey ? "text-gray-500 border-white/10" : "text-gray-500 border-orange-200"
              )}>
                {hora.label}
              </div>
              
              {/* Actividades */}
              <div className="flex-1 py-1 space-y-1">
                {actividadesHora.length === 0 ? (
                  <div className={cn(
                    "h-full flex items-center text-sm italic",
                    isHey ? "text-gray-600" : "text-gray-300"
                  )}>
                    {/* Espacio vacío */}
                  </div>
                ) : (
                  actividadesHora.map(actividad => {
                    const Icono = ICONOS_TIPO[actividad.tipo]
                    return (
                      <div
                        key={actividad.id}
                        onClick={() => toggleActividad(actividad.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                          actividad.completada 
                            ? isHey ? "bg-white/5 opacity-60" : "bg-gray-100 opacity-60"
                            : isHey ? "bg-white/10 hover:bg-white/15" : "bg-white hover:bg-orange-50 shadow-sm border border-orange-100"
                        )}
                      >
                        {/* Indicador de color */}
                        <div className={cn("w-1 h-8 rounded-full shrink-0", actividad.color)} />
                        
                        {/* Checkbox */}
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center shrink-0",
                          actividad.completada
                            ? isHey ? "bg-green-500 border-green-500" : "bg-green-500 border-green-500"
                            : isHey ? "border-gray-500" : "border-gray-300"
                        )}>
                          {actividad.completada && <Check className="w-3 h-3 text-white" />}
                        </div>
                        
                        {/* Icono y contenido */}
                        <Icono className={cn("w-4 h-4 shrink-0", isHey ? "text-gray-400" : "text-gray-500")} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            actividad.completada && "line-through",
                            isHey ? "text-gray-200" : "text-gray-700"
                          )}>
                            {actividad.titulo}
                          </p>
                          {actividad.cliente && (
                            <p className={cn("text-xs truncate", isHey ? "text-gray-500" : "text-gray-400")}>
                              {actividad.cliente}
                            </p>
                          )}
                        </div>
                        
                        {/* Duración */}
                        <span className={cn(
                          "text-xs shrink-0 whitespace-nowrap",
                          isHey ? "text-gray-500" : "text-gray-400"
                        )}>
                          Tiempo estimado: {actividad.duracion} min
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
