/**
 * Configuración de layout dinámico + permisos del módulo Ofertas.
 *
 * Réplica EXACTA de la demo AppScript (Documento B): objeto Oportunidades con
 * 6 campos, 4 secciones y la matriz de permisos por perfil.
 *  - CAMPOS_SISTEMA        -> hoja CamposSistema
 *  - LAYOUT_CAMPOS         -> hoja LayoutCampos
 *  - PERMISOS_CAMPO_PERFIL -> hoja PermisosCampoPerfil
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

/** Catálogo maestro de campos (objeto: oportunidades) — igual al AppScript */
export const CAMPOS_SISTEMA: CampoSistema[] = [
  { idCampo: 'CAM_OPP_001', key: 'nombre', label: 'Cliente', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OPP_002', key: 'rfc', label: 'RFC', tipoDato: 'Texto', activo: true, sensible: true },
  { idCampo: 'CAM_OPP_003', key: 'productoInteres', label: 'Producto', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OPP_004', key: 'monto', label: 'Monto', tipoDato: 'Moneda', activo: true, sensible: false },
  { idCampo: 'CAM_OPP_005', key: 'etapa', label: 'Etapa', tipoDato: 'Texto', activo: true, sensible: false },
  { idCampo: 'CAM_OPP_006', key: 'fechaCierre', label: 'Fecha de cierre', tipoDato: 'Fecha', activo: true, sensible: false },
]

/** Layout: visibilidad, sección, orden y ancho — igual al AppScript */
export const LAYOUT_CAMPOS: LayoutCampo[] = [
  { idCampo: 'CAM_OPP_001', visibleLayout: true, seccion: 'Datos generales', orden: 1, ancho: 6 },
  { idCampo: 'CAM_OPP_002', visibleLayout: true, seccion: 'Datos fiscales', orden: 2, ancho: 6 },
  { idCampo: 'CAM_OPP_003', visibleLayout: true, seccion: 'Datos comerciales', orden: 3, ancho: 6 },
  { idCampo: 'CAM_OPP_004', visibleLayout: true, seccion: 'Datos comerciales', orden: 4, ancho: 6 },
  { idCampo: 'CAM_OPP_005', visibleLayout: true, seccion: 'Seguimiento', orden: 5, ancho: 6 },
  { idCampo: 'CAM_OPP_006', visibleLayout: true, seccion: 'Seguimiento', orden: 6, ancho: 6 },
]

/**
 * Permisos por perfil (hoja PermisosCampoPerfil). Matriz literal del AppScript.
 * Resultado esperado:
 *  - EJECUTIVO: Cliente visible no editable; RFC no visible; Producto editable;
 *    Monto visible no editable; Etapa y Fecha de cierre editables.
 *  - GERENTE: Cliente visible no editable; RFC visible enmascarado no editable;
 *    Producto, Monto, Etapa y Fecha de cierre editables.
 *  - STAFF: Cliente visible no editable; RFC no visible; Producto, Monto, Etapa
 *    y Fecha de cierre visibles pero no editables.
 */
export const PERMISOS_CAMPO_PERFIL: PermisoCampoPerfil[] = [
  // EJECUTIVO
  { perfil: 'EJECUTIVO', idCampo: 'CAM_OPP_001', puedeLeer: true, puedeEditar: false, mascarar: false },
  { perfil: 'EJECUTIVO', idCampo: 'CAM_OPP_002', puedeLeer: false, puedeEditar: false, mascarar: true },
  { perfil: 'EJECUTIVO', idCampo: 'CAM_OPP_003', puedeLeer: true, puedeEditar: true, mascarar: false },
  { perfil: 'EJECUTIVO', idCampo: 'CAM_OPP_004', puedeLeer: true, puedeEditar: false, mascarar: false },
  { perfil: 'EJECUTIVO', idCampo: 'CAM_OPP_005', puedeLeer: true, puedeEditar: true, mascarar: false },
  { perfil: 'EJECUTIVO', idCampo: 'CAM_OPP_006', puedeLeer: true, puedeEditar: true, mascarar: false },
  // GERENTE
  { perfil: 'GERENTE', idCampo: 'CAM_OPP_001', puedeLeer: true, puedeEditar: false, mascarar: false },
  { perfil: 'GERENTE', idCampo: 'CAM_OPP_002', puedeLeer: true, puedeEditar: false, mascarar: true },
  { perfil: 'GERENTE', idCampo: 'CAM_OPP_003', puedeLeer: true, puedeEditar: true, mascarar: false },
  { perfil: 'GERENTE', idCampo: 'CAM_OPP_004', puedeLeer: true, puedeEditar: true, mascarar: false },
  { perfil: 'GERENTE', idCampo: 'CAM_OPP_005', puedeLeer: true, puedeEditar: true, mascarar: false },
  { perfil: 'GERENTE', idCampo: 'CAM_OPP_006', puedeLeer: true, puedeEditar: true, mascarar: false },
  // STAFF
  { perfil: 'STAFF', idCampo: 'CAM_OPP_001', puedeLeer: true, puedeEditar: false, mascarar: false },
  { perfil: 'STAFF', idCampo: 'CAM_OPP_002', puedeLeer: false, puedeEditar: false, mascarar: true },
  { perfil: 'STAFF', idCampo: 'CAM_OPP_003', puedeLeer: true, puedeEditar: false, mascarar: false },
  { perfil: 'STAFF', idCampo: 'CAM_OPP_004', puedeLeer: true, puedeEditar: false, mascarar: false },
  { perfil: 'STAFF', idCampo: 'CAM_OPP_005', puedeLeer: true, puedeEditar: false, mascarar: false },
  { perfil: 'STAFF', idCampo: 'CAM_OPP_006', puedeLeer: true, puedeEditar: false, mascarar: false },
]

/** Resuelve el permiso efectivo de un campo para un perfil */
function permisoDe(perfil: Perfil, idCampo: string): Omit<PermisoCampoPerfil, 'perfil' | 'idCampo'> {
  const p = PERMISOS_CAMPO_PERFIL.find((x) => x.perfil === perfil && x.idCampo === idCampo)
  return p
    ? { puedeLeer: p.puedeLeer, puedeEditar: p.puedeEditar, mascarar: p.mascarar }
    : { puedeLeer: true, puedeEditar: false, mascarar: false }
}

/**
 * Compila el contexto de acceso para un perfil (equiv. buildUserAccessContext_).
 *
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
