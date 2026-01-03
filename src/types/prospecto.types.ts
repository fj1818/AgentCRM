/**
 * Tipos para la entidad Prospecto
 */

export type TipoPersonaProspecto = 'Persona Moral' | 'Persona Fisica con Actividad Empresarial' | 'Persona Fisica'

export interface Prospecto {
  /** ID único de 18 caracteres que inicia con "Pr" + 16 caracteres alfanuméricos */
  idProspecto: string
  /** RFC del prospecto (12 dígitos para Persona Moral, 13 para personas físicas) */
  rfc: string
  /** Tipo de persona */
  tipoPersona: TipoPersonaProspecto
  /** Fecha de alta del prospecto en formato dd/mm/yyyy */
  fechaAlta: string
  /** Fecha de conversión a cliente en formato dd/mm/yyyy (opcional) */
  fechaConversion?: string
  /** IDE del cliente - solo presente si el prospecto se convirtió a cliente */
  ide?: number
}
