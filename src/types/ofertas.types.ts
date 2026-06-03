/**
 * Tipos del módulo Ofertas (fusión de Prospectos + Oportunidades).
 *
 * Recrea el modelo de layout dinámico + permisos por perfil de la demo
 * AppScript (hojas CamposSistema, LayoutCampos, PermisosCampoPerfil) en TS.
 */

/** Perfiles demo (sin SSO; se eligen desde un selector) */
export type Perfil = 'EJECUTIVO' | 'GERENTE' | 'STAFF'

export type TipoDato = 'Texto' | 'Moneda' | 'Fecha' | 'Select'

/** Origen del registro unificado */
export type OrigenOferta = 'cliente' | 'prospecto'

/** Registro unificado de oferta (cliente u oportunidad + prospecto) */
export interface Oferta {
  idOferta: string
  origen: OrigenOferta
  /** IDE del cliente o idProspecto, según origen */
  refId: string
  nombre: string
  rfc: string
  tipoPersona: string
  familiaProducto: string
  productoInteres: string
  monto: number
  etapa: string
  campaña: string
  promotor: string
  fechaAlta: string
  descripcionOferta: string
}

/** Catálogo maestro de campos (equiv. hoja CamposSistema) */
export interface CampoSistema {
  idCampo: string
  /** clave técnica = propiedad de Oferta */
  key: keyof Oferta
  label: string
  tipoDato: TipoDato
  activo: boolean
  sensible: boolean
}

/** Configuración visual de un campo (equiv. hoja LayoutCampos) */
export interface LayoutCampo {
  idCampo: string
  visibleLayout: boolean
  seccion: string
  orden: number
  ancho: number
}

/** Permiso de un campo para un perfil (equiv. hoja PermisosCampoPerfil) */
export interface PermisoCampoPerfil {
  perfil: Perfil
  idCampo: string
  puedeLeer: boolean
  puedeEditar: boolean
  mascarar: boolean
}

/** Campo ya compilado para render, combinando catálogo + layout + permiso */
export interface CampoCompilado {
  key: keyof Oferta
  label: string
  tipoDato: TipoDato
  seccion: string
  orden: number
  ancho: number
  visible: boolean
  editable: boolean
  masked: boolean
}

/** Contexto de acceso compilado para un perfil (equiv. UserAccessContext) */
export interface UserAccessContext {
  perfil: Perfil
  campos: CampoCompilado[]
}
