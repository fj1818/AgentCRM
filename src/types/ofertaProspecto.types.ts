/**
 * Tipos para la entidad OfertaProspecto
 */

export type FamiliaProducto = 'TDC' | 'TPV' | 'Cheques'

export type EtapaOferta = 
  | 'No contactado'
  | 'En negociación'
  | 'Interesado'
  | 'Descartado'
  | 'Convertido'

export type CampañaOrigen = 
  | 'Referencia Propia'
  | 'Pagina Web'
  | 'App'
  | 'Portal'
  | 'Campaña Prospectos Perfilados 2026'
  | 'Campaña Navidad 2025'
  | 'Campaña PyMEs Digital'
  | 'Campaña Empresarios Hey'

export interface OfertaProspecto {
  /** ID de la oferta: 18 caracteres que inician con "OP" */
  idOferta: string
  /** ID del prospecto (FK a tabla prospectos) */
  idProspecto: string
  /** Número de promotor asignado (FK a tabla promotores) */
  numeroPromotor: string
  /** Familia de producto: TDC, TPV, Cheques */
  familiaProducto: FamiliaProducto
  /** Nombre específico del producto según la familia */
  productoInteres: string
  /** Descripción / Script de venta de la oferta */
  descripcionOferta: string
  /** Fecha de alta de la oferta dd/mm/yyyy */
  fechaAlta: string
  /** Fecha de baja/descarte dd/mm/yyyy (opcional) */
  fechaBaja?: string
  /** Etapa actual de la oferta */
  etapa: EtapaOferta
  /** Campaña de origen */
  campaña: CampañaOrigen
  /** Monto de interés del cliente */
  montoInteres: number
  /** ID de oportunidad si se convirtió: 18 caracteres que inician con "OC" */
  idOportunidad?: string
}
