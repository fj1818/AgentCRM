export interface ProspectoOferta {
  idOferta: string
  idProspecto: string
  nombreProspecto: string
  rfc: string
  tipoPersona: string
  familiaProducto: string
  productoInteres: string
  etapa: string
  campaña: string
  montoInteres: number
  fechaAlta: string
  nombrePromotor: string
  descripcion: string
}

// Lista de promotores disponibles
export const PROMOTORES = [
  'Roberto Hernández',
  'María del Carmen López',
  'Alejandro González',
  'Ana Sofía Martínez',
  'Carlos Alberto Ruiz',
  'Lucía Fernández',
  'Jorge Luis Ramírez',
  'Patricia Torres'
]

// Generar datos de ejemplo
export function generarDatosEjemplo(): ProspectoOferta[] {
  const tiposPersona = ['Persona Moral', 'Persona Fisica con Actividad Empresarial', 'Persona Fisica']
  const familias = ['TDC', 'TPV', 'Cheques', 'Crédito', 'Seguros', 'Nómina']
  const productos: Record<string, string[]> = {
    'TDC': ['TDC Clásica', 'TDC Oro', 'TDC Platinum', 'TDC Empresarial'],
    'TPV': ['TPV Básica', 'TPV Plus', 'TPV Móvil', 'TPV eCommerce'],
    'Cheques': ['Cuenta Básica', 'Cuenta Plus', 'Cuenta Empresarial'],
    'Crédito': ['Crédito Personal', 'Crédito Auto', 'Crédito Negocios', 'Crédito Hipotecario', 'Crédito PYME'],
    'Seguros': ['Seguro de Vida', 'Seguro Auto', 'Seguro Hogar', 'Seguro Gastos Médicos', 'Seguro Empresarial'],
    'Nómina': ['Nómina Básica', 'Nómina Plus', 'Nómina Empresarial', 'Dispersión de Nómina'],
  }
  const etapas = ['No contactado', 'En negociación', 'Interesado', 'Descartado', 'Convertido']
  const campanas = ['Referencia Propia', 'Pagina Web', 'App', 'Portal', 'Campaña Prospectos Perfilados 2026']
  
  const descripciones = [
    "Cliente interesado en mejorar su tasa actual. Solicita visita presencial.",
    "Prospecto proveniente de campaña web. Requiere terminal punto de venta urgente.",
    "Empresa en expansión, busca línea de crédito para capital de trabajo.",
    "Cliente refiere mala experiencia con banco anterior. Ofrecer atención personalizada.",
    "Solicita información sobre beneficios de nómina para 50 empleados.",
    "Interesado en tarjeta corporativa con límites altos.",
    "Busca financiamiento para maquinaria nueva."
  ]
  
  const promotores = PROMOTORES

  const nombres = [
    "Juan Pérez", "María González", "Carlos López", "Ana Martínez", "Pedro Sánchez",
    "Laura Ramírez", "Jorge Fernández", "Sofía Torres", "Miguel Rodríguez", "Lucía Díaz",
    "Empresa ABC S.A. de C.V.", "Comercializadora del Norte", "Servicios Integrales", "Tecnología Avanzada",
    "Distribuidora Mexicana", "Consultores Asociados", "Constructora del Valle", "Logística Express"
  ]
  
  const datos: ProspectoOferta[] = []
  
  for (let i = 0; i < 100; i++) {
    const familia = familias[Math.floor(Math.random() * familias.length)]!
    const tipoPersona = tiposPersona[Math.floor(Math.random() * tiposPersona.length)]!
    
    const productosFamilia = productos[familia]!
    const nombreBase = nombres[Math.floor(Math.random() * nombres.length)]!
    
    datos.push({
      idOferta: `OP${String(i + 1).padStart(16, '0')}`,
      idProspecto: `Pr${String(i + 1).padStart(16, '0')}`,
      nombreProspecto: nombreBase,
      rfc: tipoPersona === 'Persona Moral' 
        ? `${['ABC', 'XYZ', 'DEF', 'GHI'][Math.floor(Math.random() * 4)]}${String(Math.floor(Math.random() * 900000) + 100000)}XX0`
        : `${['GARA', 'LOMB', 'NAVM', 'HERX'][Math.floor(Math.random() * 4)]}${String(Math.floor(Math.random() * 900000) + 100000)}XX0`,
      tipoPersona,
      familiaProducto: familia,
      productoInteres: productosFamilia[Math.floor(Math.random() * productosFamilia.length)]!,
      etapa: etapas[Math.floor(Math.random() * etapas.length)]!,
      campaña: campanas[Math.floor(Math.random() * campanas.length)]!,
      montoInteres: Math.floor(Math.random() * 500000) + 50000,
      fechaAlta: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/2026`,
      nombrePromotor: promotores[Math.floor(Math.random() * promotores.length)]!,
      descripcion: descripciones[Math.floor(Math.random() * descripciones.length)]! + " " + descripciones[Math.floor(Math.random() * descripciones.length)]!
    })
  }
  
  return datos
}

// Exportar datos generados para uso compartido
export const prospectosData = generarDatosEjemplo()
