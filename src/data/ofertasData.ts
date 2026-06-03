/**
 * Datos unificados del módulo Ofertas.
 * Fusiona ofertas de clientes (oportunidades) + ofertas de prospectos
 * en un único tipo `Oferta` con campo `origen`.
 */

import type { Oferta } from '@/types/ofertas.types'
import { ofertasClientesData } from './ofertasClientesData'
import { clientesData } from './clientesData'
import { prospectosData } from './prospectosData'

const clientesMap = new Map(clientesData.map((c) => [c.ide, c]))

const desdeClientes: Oferta[] = ofertasClientesData.map((o) => {
  const c = clientesMap.get(o.ide)
  return {
    idOferta: o.idOferta,
    origen: 'cliente',
    refId: String(o.ide),
    nombre: c?.nombreRazonSocial ?? 'Cliente desconocido',
    rfc: c?.rfc ?? '',
    tipoPersona: c?.tipoPersona ?? 'Persona Fisica',
    familiaProducto: o.familiaProducto,
    productoInteres: o.productoInteres,
    monto: o.montoOferta,
    etapa: o.etapa,
    fechaCierre: o.fechaTimbrado ?? o.fechaAlta,
    campaña: o.campaña,
    promotor: o.promotorNombre,
    fechaAlta: o.fechaAlta,
    descripcionOferta: o.descripcionOferta,
  }
})

const desdeProspectos: Oferta[] = prospectosData.map((p) => ({
  idOferta: p.idOferta,
  origen: 'prospecto',
  refId: p.idProspecto,
  nombre: p.nombreProspecto,
  rfc: p.rfc,
  tipoPersona: p.tipoPersona,
  familiaProducto: p.familiaProducto,
  productoInteres: p.productoInteres,
  monto: p.montoInteres,
  etapa: p.etapa,
  fechaCierre: p.fechaAlta,
  campaña: p.campaña,
  promotor: p.nombrePromotor,
  fechaAlta: p.fechaAlta,
  descripcionOferta: p.descripcion,
}))

export const ofertasData: Oferta[] = [...desdeClientes, ...desdeProspectos]
