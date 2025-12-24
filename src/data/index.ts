/**
 * Directorio de datos para tablas
 * 
 * Exporta datos con nombres de tabla estándar para uso con SQL service
 */

// Re-exportar con nombres estándar de tablas
export { clientesData as clientes } from './clientesData'
export { telefonosData as telefonos } from './contactabilidadData'
export { correosData as correos } from './contactabilidadData'
export { direccionesData as direcciones } from './contactabilidadData'
export { productosTDCData as tdc } from './productosTDCData'
export { chequesData as cheques } from './chequesData'
export { tpvData as tpv } from './tpvData'
export { variacionesChequesData as variacionescheques } from './variacionesChequesData'
export { promotoresData as promotores } from './promotoresData'

// También exportar los originales para compatibilidad
export * from './clientesData'
export * from './contactabilidadData'
export * from './productosTDCData'
export * from './chequesData'
export * from './tpvData'
export * from './variacionesChequesData'
export * from './promotoresData'
