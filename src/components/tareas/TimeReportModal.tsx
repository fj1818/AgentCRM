import { useState, useMemo } from 'react'
import { X, Download, FileText, Users, User } from 'lucide-react'
import { useUIStore } from '@/stores'
import { cn } from '@/utils'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface TimeReportModalProps {
  isOpen: boolean
  onClose: () => void
  actividades: any[] // Usamos any temporalmente para flexibilidad con los datos del cronograma
}

// Datos simulados para el reporte mensual y de equipo
// Actualizado para reflejar perfiles mixtos (no siempre correlacionados)
const MOCK_TEAM_STATS = [
  { nombre: 'Ana García', reuniones: 45, tareas: 120, tiempoAsignado: 85, eficiencia: 96, captacion: 450000, colocacion: 1200000 },   // Estrella (Alto en todo)
  { nombre: 'Carlos Ruiz', reuniones: 42, tareas: 115, tiempoAsignado: 88, eficiencia: 92, captacion: 180000, colocacion: 450000 },    // Muy eficiente en tiempo, pero bajos resultados financieros
  { nombre: 'Jorge Trejo', reuniones: 30, tareas: 80, tiempoAsignado: 75, eficiencia: 72, captacion: 550000, colocacion: 1100000 },     // Eficiencia media, pero EXCELENTE vendedor (Alta captación/colocación)
  { nombre: 'Sofia Méndez', reuniones: 25, tareas: 60, tiempoAsignado: 65, eficiencia: 62, captacion: 250000, colocacion: 800000 },    // Eficiencia baja, resultados financieros promedio
  { nombre: 'Luis Torres', reuniones: 15, tareas: 40, tiempoAsignado: 50, eficiencia: 45, captacion: 80000, colocacion: 200000 },      // Bajo en todo
]

// Categorización por Eficiencia de Tiempo (0-100%)
const getEfficiencyCategory = (efficiency: number) => {
  if (efficiency >= 90) return { label: 'Muy Alta', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' }
  if (efficiency >= 80) return { label: 'Alta', color: 'text-blue-700 bg-blue-100 border-blue-200' }
  if (efficiency >= 70) return { label: 'Promedio', color: 'text-yellow-700 bg-yellow-100 border-yellow-200' }
  if (efficiency >= 60) return { label: 'Baja', color: 'text-orange-700 bg-orange-100 border-orange-200' }
  return { label: 'Muy Baja', color: 'text-red-700 bg-red-100 border-red-200' }
}

// Categorización por Captación ($)
const getCaptacionCategory = (amount: number) => {
  if (amount >= 400000) return { label: 'Excelente', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' }
  if (amount >= 200000) return { label: 'Promedio', color: 'text-blue-700 bg-blue-100 border-blue-200' }
  return { label: 'Baja', color: 'text-red-700 bg-red-100 border-red-200' }
}

// Categorización por Colocación ($)
const getColocacionCategory = (amount: number) => {
  if (amount >= 1000000) return { label: 'Excelente', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' }
  if (amount >= 500000) return { label: 'Promedio', color: 'text-blue-700 bg-blue-100 border-blue-200' }
  return { label: 'Baja', color: 'text-red-700 bg-red-100 border-red-200' }
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
      eficienciaActual: 94, // Mock - Alta eficiencia
      captacionActual: 380000, // Mock - Captación Promedio (casi alta)
      colocacionActual: 1050000 // Mock - Colocación Excelente
    }
  }, [actividades])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)
  }

  const handleExportPDF = () => {
    try {
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
      doc.text('Análisis Multidimensional de Desempeño', 14, teamY)

      // Combinar usuario actual con equipo para el PDF
      const currentUserStats = {
        nombre: promotor, // Usar nombre actual
        reuniones: stats.reunionesMes,
        tareas: stats.tareasMes,
        tiempoAsignado: stats.utilizacion,
        eficiencia: stats.eficienciaActual,
        captacion: stats.captacionActual,
        colocacion: stats.colocacionActual
      }
      
      const allStats = [currentUserStats, ...MOCK_TEAM_STATS].sort((a, b) => b.eficiencia - a.eficiencia)

      autoTable(doc, {
        startY: teamY + 5,
        head: [['Ranking', 'Ejecutivo', 'Eficiencia Tiempo', 'Captación', 'Colocación']],
        body: allStats.map((p, index) => {
          const efCat = getEfficiencyCategory(p.eficiencia)
          const capCat = getCaptacionCategory(p.captacion)
          const colCat = getColocacionCategory(p.colocacion)
          
          return [
            `${index + 1}°`,
            p.nombre === promotor ? `${p.nombre} (Tú)` : p.nombre,
            `${p.eficiencia}% (${efCat.label})`,
            `${formatCurrency(p.captacion)}\n(${capCat.label})`,
            `${formatCurrency(p.colocacion)}\n(${colCat.label})`,
          ]
        }),
        headStyles: { fillColor: [59, 130, 246] }, // Blue-500 para distinguir sección
        styles: { cellPadding: 2, valign: 'middle' },
      })
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' })
          doc.text('AgenteCRM - Reporte Confidencial', 14, 290)
      }

        // Save using Data URI method to avoid Blob issues
      const dataUri = doc.output('datauristring')
      const link = document.createElement('a')
      link.href = dataUri
      link.download = `Reporte_Desempeño_${new Date().getMonth() + 1}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error al generar el PDF:', error)
      alert('Hubo un error al generar el informe. Por favor intenta de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  if (!isOpen) return null
  
  // Combinar y ordenar para la vista en pantalla también
  const currentUserStatsObj = {
      nombre: promotor,
      reuniones: stats.reunionesMes,
      tareas: stats.tareasMes,
      tiempoAsignado: stats.utilizacion,
      eficiencia: stats.eficienciaActual,
      captacion: stats.captacionActual,
      colocacion: stats.colocacionActual
  }
  const displayTeamStats = [currentUserStatsObj, ...MOCK_TEAM_STATS].sort((a, b) => b.eficiencia - a.eficiencia)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all",
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
                Análisis Multidimensional de Desempeño
              </h2>
              <p className={cn("text-sm", isHey ? "text-gray-400" : "text-gray-500")}>
                Evaluación cruzada: Eficiencia Temporal vs Resultados Financieros
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
              {isExporting ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-blue-50 border-blue-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-blue-600")}>Eficiencia Temporal</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", isHey ? "text-white" : "text-blue-700")}>{stats.eficienciaActual}%</span>
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full", getEfficiencyCategory(stats.eficienciaActual).color)}>
                    {getEfficiencyCategory(stats.eficienciaActual).label}
                </span>
              </div>
            </div>
            <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-emerald-50 border-emerald-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-emerald-600")}>Captación Mensual</p>
              <div className="flex flex-col">
                <span className={cn("text-xl font-bold", isHey ? "text-white" : "text-emerald-700")}>{formatCurrency(stats.captacionActual)}</span>
                 <span className={cn("text-xs px-0 py-0.5 w-fit mt-1 rounded-full", getCaptacionCategory(stats.captacionActual).color.replace('bg-', 'text-').split(' ')[0])}>
                    {getCaptacionCategory(stats.captacionActual).label}
                </span>
              </div>
            </div>
            <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-indigo-50 border-indigo-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-indigo-600")}>Colocación Mensual</p>
               <div className="flex flex-col">
                <span className={cn("text-xl font-bold", isHey ? "text-white" : "text-indigo-700")}>{formatCurrency(stats.colocacionActual)}</span>
                 <span className={cn("text-xs px-0 py-0.5 w-fit mt-1 rounded-full", getColocacionCategory(stats.colocacionActual).color.replace('bg-', 'text-').split(' ')[0])}>
                    {getColocacionCategory(stats.colocacionActual).label}
                </span>
              </div>
            </div>
             <div className={cn("p-4 rounded-xl border", isHey ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100")}>
              <p className={cn("text-xs mb-1", isHey ? "text-gray-400" : "text-gray-600")}>Ranking General</p>
              <span className={cn("text-2xl font-bold", isHey ? "text-white" : "text-gray-700")}>2° <span className="text-sm font-normal text-gray-400">/ 6</span></span>
            </div>
          </div>

          {/* Team Stats Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={cn("font-semibold flex items-center gap-2", isHey ? "text-white" : "text-gray-800")}>
                <Users className="w-5 h-5" />
                Comparativa de Equipo (Ranking)
              </h3>
            </div>
            
            <div className={cn("rounded-xl border overflow-hidden", isHey ? "border-white/10" : "border-gray-200")}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={cn(isHey ? "bg-white/5 text-gray-300" : "bg-gray-50 text-gray-600")}>
                    <th className="px-4 py-3 text-center font-medium w-12">#</th>
                    <th className="px-4 py-3 text-left font-medium">Ejecutivo</th>
                    <th className="px-4 py-3 text-center font-medium">Eficiencia Temporal</th>
                    <th className="px-4 py-3 text-right font-medium">Captación</th>
                    <th className="px-4 py-3 text-right font-medium">Colocación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {displayTeamStats.map((stat, i) => {
                    const isMe = stat.nombre === promotor
                    const efCat = getEfficiencyCategory(stat.eficiencia)
                    const capCat = getCaptacionCategory(stat.captacion)
                    const colCat = getColocacionCategory(stat.colocacion)
                    
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
                        <div className="flex flex-col">
                            <span>{stat.nombre} {isMe && '(Tú)'}</span>
                            <span className="text-[10px] text-gray-400">{stat.reuniones} reuniones • {stat.tareas} tareas</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-base">{stat.eficiencia}%</span>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", efCat.color)}>
                              {efCat.label}
                            </span>
                         </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                         <div className="flex flex-col items-end gap-1">
                            <span className="font-mono">{formatCurrency(stat.captacion)}</span>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", capCat.color)}>
                              {capCat.label}
                            </span>
                         </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                         <div className="flex flex-col items-end gap-1">
                            <span className="font-mono">{formatCurrency(stat.colocacion)}</span>
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", colCat.color)}>
                              {colCat.label}
                            </span>
                         </div>
                      </td>
                    </tr>
                  )})} 
                </tbody>
              </table>
            </div>
             <p className={cn("text-xs text-center mt-4", isHey ? "text-gray-500" : "text-gray-400")}>
                * Categorías calculadas independientemente para cada métrica.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
