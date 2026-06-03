/**
 * Utilidades de formato compartidas para tablas y KPIs del chat.
 */

/** Traduce nombres de columnas técnicos a español legible */
export function traducirColumna(columna: string): string {
  const traducciones: Record<string, string> = {
    tipoPersona: 'Tipo de Persona',
    producto: 'Producto',
    estado: 'Estado',
    municipio: 'Municipio',
    value: 'Valor',
    cantidad: 'Total',
    total: 'Total',
    monto: 'Monto',
    nombre: 'Nombre',
    rfc: 'RFC',
    fechaAlta: 'Fecha de Alta',
    fechaBaja: 'Fecha de Baja',
    fechaVencimiento: 'Vencimiento',
    proximoVencimiento: 'Próx. Vencimiento',
    diasRestantes: 'Días Restantes',
    ide: 'ID',
    idOferta: 'ID Oferta',
    idProspecto: 'ID Prospecto',
    numeroPromotor: 'Promotor',
    numeroLinea: 'Número de Línea',
    lineaTotal: 'Línea Total',
    lineaDisponible: 'Línea Disponible',
    lineaUso: 'Línea en Uso',
    telefono: 'Teléfono',
    correo: 'Correo Electrónico',
    calle: 'Calle',
    numero: 'Número',
    cp: 'Código Postal',
    colonia: 'Colonia',
    familiaProducto: 'Familia',
    productoInteres: 'Producto',
    montoInteres: 'Monto',
    montoOferta: 'Monto',
    etapa: 'Etapa',
    rentabilidadTotal: 'Rentabilidad Anual',
    rentTDC: 'Margen TDC',
    rentCredito: 'Margen Crédito',
    rentCheques: 'Margen Cheques',
    rentTPV: 'Margen TPV',
    rentSeguros: 'Margen Seguros',
    rentNomina: 'Margen Nómina',
  }

  if (traducciones[columna]) return traducciones[columna]

  const sinPrefijo = columna.split('_').pop() || columna
  if (traducciones[sinPrefijo]) return traducciones[sinPrefijo]

  return columna.charAt(0).toUpperCase() + columna.slice(1).replace(/_/g, ' ')
}

/** ¿La columna representa un monto de dinero? */
export function esColumnaMoneda(columna: string): boolean {
  const c = columna.toLowerCase()
  return (
    c.includes('linea') ||
    c.includes('monto') ||
    c.includes('saldo') ||
    c.includes('facturacion') ||
    c.includes('prima') ||
    c.includes('credito') ||
    c.includes('rent') ||
    c.includes('total') ||
    c.includes('disponible') ||
    c.includes('ingreso') ||
    c.includes('egreso') ||
    (c.includes('uso') && !c.includes('porcentaje'))
  )
}

/** Formatea valores para mostrar en celdas */
export function formatearValor(valor: unknown, columna: string): string {
  if (valor === null || valor === undefined || valor === '') return '—'

  const colLower = columna.toLowerCase()

  // IDE/id con 8 dígitos
  if (colLower === 'ide' || colLower === 'id') {
    return String(valor).padStart(8, '0')
  }

  if (typeof valor === 'number') {
    if (colLower.includes('porcentaje') || colLower.includes('percent')) {
      return `${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
    }
    if (colLower.includes('dias')) {
      return `${valor.toLocaleString('es-MX')} días`
    }
    if (esColumnaMoneda(columna)) {
      return `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return valor.toLocaleString('es-MX')
  }

  return String(valor)
}
