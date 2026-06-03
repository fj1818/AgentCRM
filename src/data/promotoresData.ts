/**
 * Datos de promotores pre-generados
 * 
 * Columnas:
 * - NumeroPromotor: 6 dígitos con padding de 0s
 * - FechaAlta/FechaBaja: dd/mm/yyyy
 * - Activo: boolean
 * - Banco: Banregio, Hey
 * - Territorio: Noroeste, Noreste, Sur, Centro, Centro Occidente
 * - Region: municipios del país
 * - SucursalEquipo: Sucursal 1-3 (Banregio) o Hey Brokers/Negocios/Pago (Hey)
 */

import type { 
  Promotor, 
  BancoPromotor, 
  TerritorioPromotor, 
  SucursalBanregio, 
  EquipoHey 
} from '@/types/promotor.types'

const territorios: TerritorioPromotor[] = [
  'Noroeste',
  'Noreste',
  'Sur',
  'Centro',
  'Centro Occidente',
]

const regiones: string[] = [
  'Monterrey, N.L.',
  'Guadalajara, Jal.',
  'Ciudad de México',
  'Tijuana, B.C.',
  'León, Gto.',
  'Puebla, Pue.',
  'Querétaro, Qro.',
  'Mérida, Yuc.',
  'San Luis Potosí, S.L.P.',
  'Aguascalientes, Ags.',
  'Chihuahua, Chih.',
  'Hermosillo, Son.',
  'Saltillo, Coah.',
  'Torreón, Coah.',
  'Culiacán, Sin.',
  'Cancún, Q.R.',
  'Veracruz, Ver.',
  'Tampico, Tamps.',
  'Reynosa, Tamps.',
  'Nuevo Laredo, Tamps.',
]

const sucursalesBanregio: SucursalBanregio[] = ['Sucursal 1', 'Sucursal 2', 'Sucursal 3']
const equiposHey: EquipoHey[] = ['Equipo 1', 'Equipo 2', 'Equipo 3']

function generarFecha(añoInicio: number = 2015, añoFin: number = 2024): string {
  const año = Math.floor(Math.random() * (añoFin - añoInicio + 1)) + añoInicio
  const mes = Math.floor(Math.random() * 12) + 1
  const dia = Math.floor(Math.random() * 28) + 1
  return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`
}

const NOMBRES_PROMOTORES = [
  'Roberto Hernández',
  'María del Carmen López',
  'Alejandro González',
  'Ana Sofía Martínez',
  'Carlos Alberto Ruiz',
  'Lucía Fernández',
  'Jorge Luis Ramírez',
  'Patricia Torres',
  'Eduardo Morales',
  'Gabriela Castillo',
  'Fernando Vargas',
  'Mónica Jiménez'
]

function padNumeroPromotor(num: number): string {
  return num.toString().padStart(6, '0')
}

export function generarPromotoresSimulados(cantidad: number = 50): Promotor[] {
  const promotores: Promotor[] = []
  const numerosUsados = new Set<number>()
  
  // Siempre incluir el promotor principal 017577
  const promotorPrincipal: Promotor = {
    numeroPromotor: '017577',
    nombre: 'Roberto Hernández', // Nombre fijo para el principal
    fechaAlta: '15/03/2018',
    activo: true,
    banco: 'Banco A',
    territorio: 'Noreste',
    region: 'Monterrey, N.L.',
    sucursalEquipo: 'Sucursal 1',
  }
  promotores.push(promotorPrincipal)
  numerosUsados.add(17577)
  
  // Generar el resto de promotores
  while (promotores.length < cantidad) {
    const numero = Math.floor(Math.random() * 99999) + 1
    if (numerosUsados.has(numero)) continue
    numerosUsados.add(numero)
    
    // Asignar nombre consistente basado en el número
    const nombre = NOMBRES_PROMOTORES[numero % NOMBRES_PROMOTORES.length]!

    const banco: BancoPromotor = Math.random() > 0.4 ? 'Banco A' : 'Banco B'
    const tieneFechaBaja = Math.random() < 0.10
    const fechaBaja = tieneFechaBaja ? generarFecha(2023, 2024) : undefined
    
    const territorioIdx = Math.floor(Math.random() * territorios.length)
    const regionIdx = Math.floor(Math.random() * regiones.length)
    
    // Asignar sucursal o equipo según banco
    const sucursalEquipo = banco === 'Banco A'
      ? sucursalesBanregio[Math.floor(Math.random() * sucursalesBanregio.length)]!
      : equiposHey[Math.floor(Math.random() * equiposHey.length)]!
    
    promotores.push({
      numeroPromotor: padNumeroPromotor(numero),
      nombre,
      fechaAlta: generarFecha(2015, 2023),
      fechaBaja,
      activo: !tieneFechaBaja,
      banco,
      territorio: territorios[territorioIdx]!,
      region: regiones[regionIdx]!,
      sucursalEquipo,
    })
  }
  
  return promotores
}

// Pre-generar datos de promotores
export const promotoresData = generarPromotoresSimulados(50)

// Funciones de acceso
export function obtenerPromotorPorNumero(numero: string): Promotor | undefined {
  return promotoresData.find(p => p.numeroPromotor === numero)
}

export function obtenerPromotoresActivos(): Promotor[] {
  return promotoresData.filter(p => p.activo)
}

export function obtenerPromotoresPorBanco(banco: BancoPromotor): Promotor[] {
  return promotoresData.filter(p => p.banco === banco)
}

export function obtenerPromotoresPorTerritorio(territorio: TerritorioPromotor): Promotor[] {
  return promotoresData.filter(p => p.territorio === territorio)
}

// Número del promotor actual (para filtrado de portafolio)
export const NUMERO_PROMOTOR_ACTUAL = '017577'
