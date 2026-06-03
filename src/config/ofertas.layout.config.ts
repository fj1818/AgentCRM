/**
 * Configuración de layout dinámico + permisos del módulo Ofertas.
 *
 * Equivale a las hojas de la demo AppScript:
 *  - CAMPOS_SISTEMA      -> CamposSistema
 *  - LAYOUT_CAMPOS       -> LayoutCampos
 *  - PERMISOS_CAMPO_PERFIL -> PermisosCampoPerfil
 *
 * Cambia visibilidad, orden, secciones y permisos SIN tocar componentes.
 */

import type {
  CampoSistema,
  LayoutCampo,
  PermisoCampoPerfil,
  Perfil,
  UserAccessContext,
  CampoCompilado,
} from '@/types/ofertas.types'

export const PERFILES: Perfil[] = ['EJECUTIVO', 'GERENTE', 'STAFF']

/** Catálogo maestro de campos (objeto: ofertas) */
export const CAMPOS_SISTEMA: CampoSistema[] = [
  { idCampo: 'CAM_OF_001', key: 'nombre', label: 'Nombre / Razón social', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OF_002', key: 'rfc', label: 'RFC', tipoDato: 'Texto', activo: true, sensible: true },
  { idCampo: 'CAM_OF_003', key: 'tipoPersona', label: 'Tipo de persona', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OF_004', key: 'origen', label: 'Origen', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OF_005', key: 'familiaProducto', label: 'Familia de producto', tipoDato: 'Select', activo: true, sensible: false },
  { idCampo: 'CAM_OF_006', key: 'productoInteres', label: 'Producto de interés', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OF_007', key: 'monto', label: 'Monto', tipoDato: 'Moneda', activo: true, sensible: false },
  { idCampo: 'CAM_OF_008', key: 'etapa', label: 'Etapa', tipoDato: 'Select', activo: true, sensible: false },
  { idCampo: 'CAM_OF_009', key: 'campaña', label: 'Campaña', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OF_010', key: 'promotor', label: 'Promotor', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OF_011', key: 'fechaAlta', label: 'Fecha de alta', tipoDato: 'Fecha', activo: true, sensible: false },
  { idCampo: 'CAM_OF_012', key: 'descripcionOferta', label: 'Descripción', tipoDato: 'Texto', activo: true, sensible: false },
]

/** Layout: visibilidad, sección, orden y ancho (1-12) */
export const LAYOUT_CAMPOS: LayoutCampo[] = [
  { idCampo: 'CAM_OF_001', visibleLayout: true, seccion: 'Datos generales', orden: 1, ancho: 6 },
  { idCampo: 'CAM_OF_003', visibleLayout: true, seccion: 'Datos generales', orden: 2, ancho: 6 },
  { idCampo: 'CAM_OF_004', visibleLayout: true, seccion: 'Datos generales', orden: 3, ancho: 6 },
  { idCampo: 'CAM_OF_002', visibleLayout: true, seccion: 'Datos fiscales', orden: 4, ancho: 6 },
  { idCampo: 'CAM_OF_005', visibleLayout: true, seccion: 'Datos comerciales', orden: 5, ancho: 6 },
  { idCampo: 'CAM_OF_006', visibleLayout: true, seccion: 'Datos comerciales', orden: 6, ancho: 6 },
  { idCampo: 'CAM_OF_007', visibleLayout: true, seccion: 'Datos comerciales', orden: 7, ancho: 6 },
  { idCampo: 'CAM_OF_009', visibleLayout: true, seccion: 'Datos comerciales', orden: 8, ancho: 6 },
  { idCampo: 'CAM_OF_010', visibleLayout: true, seccion: 'Datos comerciales', orden: 9, ancho: 6 },
  { idCampo: 'CAM_OF_008', visibleLayout: true, seccion: 'Seguimiento', orden: 10, ancho: 6 },
  { idCampo: 'CAM_OF_011', visibleLayout: true, seccion: 'Seguimiento', orden: 11, ancho: 6 },
  { idCampo: 'CAM_OF_012', visibleLayout: true, seccion: 'Seguimiento', orden: 12, ancho: 12 },
]

/**
 * Permisos por perfil. Solo se listan los campos con regla particular;
 * lo no listado usa el default (leer sí, editar no, sin máscara).
 */
const DEFAULT_PERMISO = { puedeLeer: true, puedeEditar: false, mascarar: false }

const PERMISOS_OVERRIDE: Record<Perfil, Partial<Record<string, Partial<Omit<PermisoCampoPerfil, 'perfil' | 'idCampo'>>>>> = {
  EJECUTIVO: {
    // RFC no visible para ejecutivo
    CAM_OF_002: { puedeLeer: false, mascarar: true },
    CAM_OF_006: { puedeEditar: true }, // producto editable
    CAM_OF_007: { puedeEditar: false }, // monto solo lectura
    CAM_OF_008: { puedeEditar: true }, // etapa editable
    CAM_OF_011: { puedeEditar: true }, // fecha editable
    CAM_OF_012: { puedeEditar: true }, // descripción editable
  },
  GERENTE: {
    // RFC visible pero enmascarado y no editable
    CAM_OF_002: { puedeLeer: true, mascarar: true, puedeEditar: false },
    CAM_OF_005: { puedeEditar: true },
    CAM_OF_006: { puedeEditar: true },
    CAM_OF_007: { puedeEditar: true }, // monto editable para gerente
    CAM_OF_008: { puedeEditar: true },
    CAM_OF_011: { puedeEditar: true },
    CAM_OF_012: { puedeEditar: true },
  },
  STAFF: {
    // Staff todo lectura; RFC oculto
    CAM_OF_002: { puedeLeer: false, mascarar: true },
  },
}

/** Resuelve el permiso efectivo de un campo para un perfil */
function permisoDe(perfil: Perfil, idCampo: string): Omit<PermisoCampoPerfil, 'perfil' | 'idCampo'> {
  const override = PERMISOS_OVERRIDE[perfil]?.[idCampo] ?? {}
  return { ...DEFAULT_PERMISO, ...override }
}

/**
 * Compila el contexto de acceso para un perfil (equiv. buildUserAccessContext_).
 *
 * Reglas:
 *  visible  = campo.activo && layout.visibleLayout && permiso.puedeLeer
 *  editable = visible && permiso.puedeEditar
 *  masked   = permiso.mascarar
 *  orden    = layout.orden
 */
export function buildAccessContext(perfil: Perfil): UserAccessContext {
  const layoutMap = new Map(LAYOUT_CAMPOS.map((l) => [l.idCampo, l]))

  const campos: CampoCompilado[] = CAMPOS_SISTEMA.map((campo) => {
    const layout = layoutMap.get(campo.idCampo)
    const permiso = permisoDe(perfil, campo.idCampo)
    const visible = campo.activo && !!layout?.visibleLayout && permiso.puedeLeer

    return {
      key: campo.key,
      label: campo.label,
      tipoDato: campo.tipoDato,
      seccion: layout?.seccion ?? 'Otros',
      orden: layout?.orden ?? 999,
      ancho: layout?.ancho ?? 6,
      visible,
      editable: visible && permiso.puedeEditar,
      masked: permiso.mascarar,
    }
  })
    .filter((c) => c.visible)
    .sort((a, b) => a.orden - b.orden)

  return { perfil, campos }
}

/** Agrupa los campos compilados por sección, respetando el orden */
export function agruparPorSeccion(ctx: UserAccessContext): { seccion: string; campos: CampoCompilado[] }[] {
  const orden: string[] = []
  const map = new Map<string, CampoCompilado[]>()
  for (const campo of ctx.campos) {
    if (!map.has(campo.seccion)) {
      map.set(campo.seccion, [])
      orden.push(campo.seccion)
    }
    map.get(campo.seccion)!.push(campo)
  }
  return orden.map((seccion) => ({ seccion, campos: map.get(seccion)! }))
}
