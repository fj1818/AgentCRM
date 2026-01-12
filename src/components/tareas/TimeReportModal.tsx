import { useState, useMemo } from 'react'
import { X, Download, FileText, Users, TrendingUp, User } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface TimeReportModalProps {
  isOpen: boolean
  onClose: () => void
  actividades: any[] // Usamos any temporalmente para flexibilidad con los datos del cronograma
}

// Datos simulados para el reporte mensual y de equipo
const MOCK_TEAM_STATS = [
  { nombre: 'Ana García', reuniones: 45, tareas: 120, tiempoAsignado: 85, eficiencia: 96 },   // Altamente Eficiente
  { nombre: 'Carlos Ruiz', reuniones: 42, tareas: 115, tiempoAsignado: 88, eficiencia: 85 },   // Moderadamente Eficiente
  { nombre: 'Jorge Trejo', reuniones: 30, tareas: 80, tiempoAsignado: 75, eficiencia: 72 },    // Promedio
  { nombre: 'Sofia Méndez', reuniones: 25, tareas: 60, tiempoAsignado: 65, eficiencia: 62 },   // Deficiente
  { nombre: 'Luis Torres', reuniones: 15, tareas: 40, tiempoAsignado: 50, eficiencia: 45 },    // Altamente Deficiente
]

const getEfficiencyCategory = (efficiency: number) => {
  if (efficiency >= 90) return { label: 'Altamente Eficiente', color: 'text-emerald-600 bg-emerald-100' }
  if (efficiency >= 80) return { label: 'Moderadamente Eficiente', color: 'text-blue-600 bg-blue-100' }
  if (efficiency >= 70) return { label: 'Promedio', color: 'text-yellow-600 bg-yellow-100' }
  if (efficiency >= 60) return { label: 'Deficiente', color: 'text-orange-600 bg-orange-100' }
  return { label: 'Altamente Deficiente', color: 'text-red-600 bg-red-100' }
}

export function TimeReportModal({ isOpen, onClose, actividades }: TimeReportModalProps) {
  const { theme } = useUIStore()
  const isHey = theme === 'hey'
  const [promotor, setPromotor] = useState('Ejecutivo Comercial')
  const [isExporting, setIsExporting] = useState(false)

  // Calcular métricas del mes (simulado base + datos actuales)
  const stats = useMemo(() => {
    // Simulamos que los datos actuales son una muestra representativa
    const totalSemanal = actividades.reduce((acc, a) => acc + a.duracion, 0)
    const planeado = actividades.filter((a: any) => a.esPlaneada).reduce((acc: number, a: any) => acc + a.duracion, 0)
    const noPlaneado = actividades.filter((a: any) => !a.esPlaneada).reduce((acc: number, a: any) => acc + a.duracion, 0)
    
    // Proyección mensual (x4 semanas)
    const totalHorasMensual = Math.round((totalSemanal * 4) / 60)
    // Forzamos 26 horas si el cálculo no da 26 y hay actividades (para demo) o usamos el real
    const displayTotal = totalHorasMensual > 0 ? totalHorasMensual : 26
    
    return {
      totalHoras: displayTotal,
      horasPlaneadas: Math.round((planeado * 4) / 60) || 26, // Mantenemos coherencia con demo
      horasNoPlaneadas: Math.round((noPlaneado * 4) / 60),
      utilizacion: Math.round((totalSemanal / (540 * 5)) * 100), // Base 9h diarias * 5 días
      reunionesMes: 48, // Mock
      tareasMes: 156, // Mock
      eficienciaActual: 94 // Mock
    }
  }, [actividades])

  // Ranking calculation
  const ranking = useMemo(() => {
    const allEfficiencies = [...MOCK_TEAM_STATS.map(s => s.eficiencia), stats.eficienciaActual]
    const average = Math.round(allEfficiencies.reduce((a, b) => a + b, 0) / allEfficiencies.length)
    const diff = stats.eficienciaActual - average
    return { average, diff }
  }, [stats.eficienciaActual])

  const handleExportPDF = () => {
    setIsExporting(true)
    const doc = new jsPDF()
    
    // Configuración de colores y fuentes
    const primaryColor = [255, 107, 0] // Orange-500
    const secondaryColor = [75, 85, 99] // Gray-600
    
    // Encabezado
    doc.setFillColor(255, 247, 237) // Orange-50
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setFontSize(22)
    doc.setTextColor(primaryColor[0] ?? 0, primaryColor[1] ?? 0, 0) // Naranja
    doc.text('Informe Mensual de Productividad', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(secondaryColor[0] ?? 0, secondaryColor[1] ?? 0, secondaryColor[2] ?? 0)
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Ejecutivo: ${promotor}`, 14, 33)

    // Sección 1: Resumen Ejecutivo
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Resumen de Utilización de Tiempo', 14, 55)
    
    // Crear tabla de métricas principales
    autoTable(doc, {
      startY: 60,
      head: [['Métrica', 'Valor', 'Descripción Temporal']],
      body: [
        ['Tiempo Total Asignado', `${stats.totalHoras} Horas`, 'Acumulado total del mes'],
        ['Tiempo Planeado', `${stats.horasPlaneadas} Horas`, 'Suma mensual estimada'],
        ['Tareas No Programadas', `${stats.horasNoPlaneadas} Horas`, 'Suma mensual acumulada'],
        ['% Ocupación Diaria', `${stats.utilizacion}%`, 'Promedio diario de ocupación'],
      ],
      headStyles: { fillColor: [249, 115, 22] }, // Orange-500
      theme: 'grid'
    })

    // Sección 2: Desglose por Actividad
    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.text('Desglose de Actividades', 14, finalY)
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Tipo', 'Cantidad Mensual', '% del Tiempo']],
      body: [
        ['Reuniones', `${stats.reunionesMes}`, '35%'],
        ['Tareas Administrativas', `${stats.tareasMes}`, '45%'],
        ['Prospección', '85', '20%'],
      ],
      theme: 'striped'
    })

    // Sección 3: Comparativa de Equipo (Tabla solicitada)
    const teamY = (doc as any).lastAutoTable.finalY + 15
    doc.text('Ranking de Desempeño y Comparativa', 14, teamY)

    // Combinar usuario actual con equipo para el PDF
    const currentUserStats = {
      nombre: promotor, // Usar nombre actual
      reuniones: stats.reunionesMes,
      tareas: stats.tareasMes,
      tiempoAsignado: stats.utilizacion,
      eficiencia: stats.eficienciaActual
    }
    
    const allStats = [currentUserStats, ...MOCK_TEAM_STATS].sort((a, b) => b.eficiencia - a.eficiencia)

    autoTable(doc, {
      startY: teamY + 5,
      head: [['Ranking', 'Ejecutivo', 'Reuniones', 'Tareas', 'Eficiencia', 'Categoría']],
      body: allStats.map((p, index) => {
        const category = getEfficiencyCategory(p.eficiencia)
        return [
          `${index + 1}°`,
          p.nombre === promotor ? `${p.nombre} (Tú)` : p.nombre,
          p.reuniones,
          p.tareas,
          `${p.eficiencia}%`,
          category.label
        ]
      }),
      headStyles: { fillColor: [59, 130, 246] }, // Blue-500 para distinguir sección
    })
    
    // Nota al pie sobre ranking
    const rankingY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setTextColor(100)
    const diffText = ranking.diff >= 0 ? `+${ranking.diff}% por encima` : `${ranking.diff}% por debajo`
    doc.text(`* Tu eficiencia está ${diffText} del promedio del equipo (${ranking.average}%).`, 14, rankingY)


    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' })
        doc.text('AgenteCRM - Reporte Confidencial', 14, 290)
    }

    doc.save(`Informe_Tiempo_${promotor.replace(' ', '_')}_${new Date().getMonth() + 1}.pdf`)
    setIsExporting(false)
  }

  if (!isOpen) return null
  
  // Combinar y ordenar para la vista en pantalla también
  const currentUserStatsObj = {
      nombre: promotor,
      reuniones: stats.reunionesMes,
      tareas: stats.tareasMes,
      tiempoAsignado: stats.utilizacion,
      eficiencia: stats.eficienciaActual
  }
  const displayTeamStats = [currentUserStatsObj, ...MOCK_TEAM_STATS].sort((a, b) => b.eficiencia - a.eficiencia)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl",
        isHey ? "bg-[#1a1f2e] border border-white/10" : "bg-white"
      )}>
        {/* Header */}
        <div className={cn(
          "p-6 border-b flex items-center justify-between sticky top-0 z-10",
          isHey ? "bg-[#1a1f2e] border-white/10" : "bg-white border-gray-100"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", isHey ? "bg-cyan-500/20" : "bg-orange-100")}>
              <FileText className={cn("w-6 h-6", isHey ? "text-cyan-400" : "text-orange-600")} />
            </div>
            <div>
              <h2 className={cn("text-xl font-bold", isHey ? "text-white" : "text-gray-800")}>
                Informe de Tiempo Ejecutivo
              </h2>
              <p className={cn("text-sm", isHey ? "text-gray-400" : "text-gray-500")}>
                Análisis mensual de productividad y eficiencia
              </p>
            </div>
          </div>
          <button onClick={onClose} className={cn("p-2 rounded-lg hover:bg-black/5 transition-colors", isHey ? "hover:bg-white/10" : "")}>
            <X className={cn("w-5 h-5", isHey ? "text-gray-400" : "text-gray-500")} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Controls */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className={cn("block text-sm font-medium mb-1", isHey ? "text-gray-300" : "text-gray-700")}>
                Promotor Analizado
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={promotor}
                  onChange={(e) => setPromotor(e.target.value)}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-offset-0 transition-all",
                    isHey 
                      ? "bg-white/5 border-white/10 text-white focus:ring-cyan-500 focus:border-cyan-500" 
                      : "bg-gray-50 border-gray-200 text-gray-800 focus:ring-orange-500 focus:border-orange-500"
                  )}
                />
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={cn(
                "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                isHey 
                  ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                  : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200"
              )}
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generando...' : 'Descargar Informe PDF'}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-blue-50 border-blue-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-blue-600")}>% Ocupación Diaria</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", isHey ? "text-white" : "text-blue-700")}>{stats.utilizacion}%</span>
                <span className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +2.5%
                </span>
              </div>
            </div>
            <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-purple-50 border-purple-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-purple-600")}>Horas Planeadas (Mes)</p>
              <span className={cn("text-2xl font-bold", isHey ? "text-white" : "text-purple-700")}>{stats.horasPlaneadas}h</span>
            </div>
            <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-yellow-50 border-yellow-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-yellow-700")}>Tareas No Programadas (Mes)</p>
              <span className={cn("text-2xl font-bold", isHey ? "text-white" : "text-yellow-800")}>{stats.horasNoPlaneadas}h</span>
            </div>
            <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-green-50 border-green-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-green-600")}>Eficiencia General</p>
              <span className={cn("text-2xl font-bold", isHey ? "text-white" : "text-green-700")}>94%</span>
            </div>
          </div>

          {/* Team Stats Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={cn("font-semibold flex items-center gap-2", isHey ? "text-white" : "text-gray-800")}>
                <Users className="w-5 h-5" />
                Comparativa de Equipo (Ranking)
              </h3>
              <div className="flex items-center gap-3">
                 <div className={cn("text-xs px-3 py-1 rounded-full border", 
                  ranking.diff >= 0 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-red-50 text-red-700 border-red-200"
                 )}>
                   {ranking.diff >= 0 ? `+${ranking.diff}% sobre media` : `${ranking.diff}% bajo media`}
                 </div>
                 <span className={cn("text-xs px-2 py-1 rounded-full", isHey ? "bg-white/10 text-gray-400" : "bg-gray-100 text-gray-500")}>
                  Enero 2026
                </span>
              </div>
            </div>
            
            <div className={cn("rounded-xl border overflow-hidden", isHey ? "border-white/10" : "border-gray-200")}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={cn(isHey ? "bg-white/5 text-gray-300" : "bg-gray-50 text-gray-600")}>
                    <th className="px-4 py-3 text-center font-medium w-12">#</th>
                    <th className="px-4 py-3 text-left font-medium">Ejecutivo</th>
                    <th className="px-4 py-3 text-center font-medium">Reuniones</th>
                    <th className="px-4 py-3 text-center font-medium">Tareas</th>
                    <th className="px-4 py-3 text-center font-medium">Eficiencia</th>
                    <th className="px-4 py-3 text-center font-medium">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {displayTeamStats.map((stat, i) => {
                    const isMe = stat.nombre === promotor
                    const category = getEfficiencyCategory(stat.eficiencia)
                    return (
                    <tr key={i} className={cn(
                       "transition-colors",
                       isMe 
                        ? (isHey ? "bg-cyan-500/10" : "bg-orange-50") 
                        : (isHey ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50")
                    )}>
                      <td className={cn("px-4 py-3 text-center font-bold", isMe ? "text-orange-600" : "text-gray-400")}>
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {stat.nombre} {isMe && '(Tú)'}
                      </td>
                      <td className="px-4 py-3 text-center">{stat.reuniones}</td>
                      <td className="px-4 py-3 text-center">{stat.tareas}</td>
                      <td className="px-4 py-3 text-center font-bold">{stat.eficiencia}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", category.color)}>
                          {category.label}
                        </span>
                      </td>
                    </tr>
                  )})} 
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
