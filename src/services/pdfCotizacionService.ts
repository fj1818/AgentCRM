
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ResultadoCotizacion } from './cotizadorService'

export const generarPDFCotizacion = (cotizacion: ResultadoCotizacion) => {
  try {
    const doc = new jsPDF()

    // Configuración de colores
    const primaryColor = [255, 107, 0] // Orange-500
    const secondaryColor = [75, 85, 99] // Gray-600

    // Encabezado
    doc.setFillColor(255, 247, 237) // Orange-50
    doc.rect(0, 0, 210, 40, 'F')

    doc.setFontSize(22)
    doc.setTextColor(primaryColor[0] ?? 0, primaryColor[1] ?? 0, 0)
    doc.text('Cotización de Crédito', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(secondaryColor[0] ?? 0, secondaryColor[1] ?? 0, secondaryColor[2] ?? 0)
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Producto: ${cotizacion.producto}`, 14, 33)

    // Sección 1: Resumen del Crédito
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Detalles del Crédito', 14, 55)

    const resumenData = [
      ['Monto a Financiar', `$${cotizacion.montoFinanciar.toLocaleString('es-MX')}`],
      ['Pago Mensual', `$${cotizacion.pagoMensual.toLocaleString('es-MX')}`],
      ['Tasa Anual', `${cotizacion.tasaAnual}%`],
      ['Plazo', `${cotizacion.plazoMeses} meses`],
      ['Total a Pagar', `$${cotizacion.totalAPagar.toLocaleString('es-MX')}`],
      ['Intereses Totales', `$${cotizacion.interesesTotales.toLocaleString('es-MX')}`]
    ]

    if (cotizacion.enganche > 0) {
      resumenData.push(['Enganche', `$${cotizacion.enganche.toLocaleString('es-MX')}`])
    }

    autoTable(doc, {
      startY: 60,
      head: [['Concepto', 'Valor']],
      body: resumenData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] }, // Orange-500
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 'auto' }
      }
    })

    // Sección 2: Tabla de Amortización
    const finalY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.text('Tabla de Amortización', 14, finalY)

    const tableData = cotizacion.tablaAmortizacion.map(fila => [
      fila.mes,
      `$${fila.pagoMensual.toLocaleString('es-MX')}`,
      `$${fila.capital.toLocaleString('es-MX')}`,
      `$${fila.interes.toLocaleString('es-MX')}`,
      `$${fila.saldo.toLocaleString('es-MX')}`
    ])

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Mes', 'Pago', 'Capital', 'Interés', 'Saldo']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [75, 85, 99] }, // Gray-600
      styles: { fontSize: 8 }
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' })
      doc.text('AgenteCRM - Simulación Informativa', 14, 290)
    }

    // Save using Data URI method for reliability
    const dataUri = doc.output('datauristring')
    const link = document.createElement('a')
    link.href = dataUri
    link.download = `Cotizacion_${cotizacion.producto.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

  } catch (error) {
    console.error('Error al generar PDF de cotización:', error)
    alert('Hubo un error al generar el PDF. Por favor intenta de nuevo.')
  }
}
