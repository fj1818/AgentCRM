/**
 * Dataset del CRM agéntico.
 *
 * Se genera con un PRNG con semilla fija para que la demo sea idéntica en cada
 * recarga: las tarjetas, montos y fechas que ve el usuario no cambian entre
 * sesiones y las capturas de pantalla siguen siendo válidas.
 */

// ── PRNG determinista ────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20260812)
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min

/** Fecha ancla de la demo. Todo se calcula relativo a este día. */
export const HOY = new Date(2026, 7, 12) // 12 de agosto de 2026

const addDays = (d: Date, days: number) => {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}
const iso = (d: Date) => d.toISOString().slice(0, 10)

// ── Tipos ────────────────────────────────────────────────────────────────────
export type TipoPersona = 'PM' | 'PFAE' | 'PF'
export type Familia = 'Crédito' | 'TDC' | 'TPV' | 'Cheques' | 'Seguros' | 'Nómina'
export type Etapa =
  | 'Prospecto'
  | 'Contactado'
  | 'Calificado'
  | 'Propuesta'
  | 'Negociación'
  | 'Ganada'
  | 'Perdida'

export const ETAPAS: Etapa[] = [
  'Prospecto',
  'Contactado',
  'Calificado',
  'Propuesta',
  'Negociación',
  'Ganada',
  'Perdida',
]

/** Etapas que siguen vivas en el embudo. */
export const ETAPAS_ABIERTAS: Etapa[] = [
  'Prospecto',
  'Contactado',
  'Calificado',
  'Propuesta',
  'Negociación',
]

export type Riesgo = 'bajo' | 'medio' | 'alto'

export interface Cliente {
  id: string
  nombre: string
  rfc: string
  tipo: TipoPersona
  giro: string
  ciudad: string
  telefono: string
  email: string
  contacto: string
  puesto: string
  ejecutivo: string
  antiguedadMeses: number
  facturacionAnual: number
  saldoPromedio: number
  productos: string[]
  salud: number
  riesgoFuga: Riesgo
  ultimoContacto: string
  nps: number
}

export interface Oferta {
  id: string
  clienteId: string
  cliente: string
  producto: string
  familia: Familia
  monto: number
  etapa: Etapa
  probabilidad: number
  fechaAlta: string
  fechaCierre: string
  ejecutivo: string
  campana: string
  notas: string
  /** Días sin movimiento en la etapa actual. */
  diasSinMover: number
}

export type TipoTarea = 'llamada' | 'visita' | 'correo' | 'documento' | 'seguimiento'
export type Prioridad = 'alta' | 'media' | 'baja'

export interface Tarea {
  id: string
  titulo: string
  tipo: TipoTarea
  clienteId?: string
  ofertaId?: string
  vence: string
  prioridad: Prioridad
  estado: 'pendiente' | 'hecha'
  responsable: string
  nota?: string
}

export type TipoActividad = 'llamada' | 'correo' | 'reunion' | 'nota' | 'sistema' | 'contrato'

export interface Actividad {
  id: string
  clienteId: string
  ofertaId?: string
  tipo: TipoActividad
  titulo: string
  detalle: string
  fecha: string
  autor: string
}

export interface Producto {
  id: string
  nombre: string
  familia: Familia
  pitch: string
  tasa: string
  comision: string
  montoMin: number
  montoMax: number
  plazo: string
  requisitos: string[]
  beneficios: string[]
  ideal: string
}

export interface Playbook {
  id: string
  categoria: 'Objeción' | 'Descubrimiento' | 'Cierre' | 'Cumplimiento'
  frente: string
  reverso: string
  tip: string
}

// ── Catálogos base ───────────────────────────────────────────────────────────
const EMPRESAS = [
  'Grupo Industrial del Norte',
  'Comercializadora Azteca',
  'Desarrollos Inmobiliarios del Golfo',
  'Tecnología Avanzada Mexicana',
  'Distribuidora Nacional de Alimentos',
  'Constructora Edificadora Regia',
  'Servicios Financieros del Bajío',
  'Importadora Frontera Norte',
  'Productos Químicos Industriales',
  'Farmacéutica Nacional Vida',
  'Automotriz del Pacífico',
  'Textiles y Confecciones Monterrey',
  'Agroindustrias del Valle',
  'Telecomunicaciones Digitales MX',
  'Energía Renovable Peninsular',
  'Logística y Transporte Express',
  'Plásticos y Empaques del Norte',
  'Consultoría Empresarial Integral',
  'Alimentos Procesados del Sureste',
  'Maquinaria y Equipos Industriales',
  'Software Solutions México',
  'Hoteles y Resorts Costa Maya',
  'Laboratorios Clínicos Avanzados',
  'Minería y Extracción Nacional',
  'Publicidad y Marketing Digital',
  'Refaccionaria Central Saltillo',
  'Panificadora La Espiga de Oro',
  'Ferretería Industrial Cumbres',
  'Clínica Dental Sonrisa Plena',
  'Muebles y Diseño Contemporáneo',
]

const PERSONAS = [
  'Juan Carlos Hernández López',
  'María Guadalupe Martínez García',
  'Roberto Carlos González Pérez',
  'Ana Patricia Rodríguez Sánchez',
  'José Luis Ramírez Flores',
  'Laura Elena Torres Morales',
  'Francisco Javier Díaz Ortiz',
  'Sandra Patricia Vázquez Cruz',
  'Miguel Ángel Castro Reyes',
  'Patricia Elena Ruiz Mendoza',
  'Diana Carolina Estrada Luna',
  'Fernando Antonio Núñez Valdez',
]

const CONTACTOS = [
  'Alejandra Ríos Beltrán',
  'Ricardo Salinas Ocampo',
  'Mónica Zavala Herrera',
  'Emilio Cárdenas Peña',
  'Sofía Lozano Andrade',
  'Guillermo Tapia Nieto',
  'Renata Villalobos Cruz',
  'Andrés Maldonado Sierra',
]

const PUESTOS = ['Director General', 'Director de Finanzas', 'Gerente Administrativo', 'Tesorero', 'Socio Fundador', 'Contralor']

const GIROS = [
  'Manufactura',
  'Comercio al por mayor',
  'Construcción',
  'Servicios profesionales',
  'Transporte y logística',
  'Alimentos y bebidas',
  'Salud',
  'Tecnología',
  'Turismo',
  'Agroindustria',
]

const CIUDADES = ['Monterrey', 'Guadalajara', 'CDMX', 'Querétaro', 'Saltillo', 'Puebla', 'Mérida', 'Tijuana', 'León', 'Cancún']

export const EJECUTIVOS = [
  'Fernando Ruvalcaba',
  'Marcela Ibarra',
  'Óscar Domínguez',
  'Paola Nájera',
  'Sergio Betancourt',
]

/** Ejecutivo que usa la demo. */
export const YO = 'Fernando Ruvalcaba'

const CAMPANAS = [
  'Referencia propia',
  'Campaña Cross-Sell PyMEs',
  'Campaña Upgrade TDC',
  'Portal web',
  'Campaña Clientes Preferentes 2026',
  'Evento Expo Industrial',
]

// ── Productos ────────────────────────────────────────────────────────────────
export const productos: Producto[] = [
  {
    id: 'PRD-CRE-PYME',
    nombre: 'Crédito PyME Simple',
    familia: 'Crédito',
    pitch: 'Capital de trabajo con disposición en 72 horas y sin garantía hipotecaria hasta 3 MDP.',
    tasa: '14.9% – 18.5% anual fija',
    comision: '1.5% por apertura',
    montoMin: 250_000,
    montoMax: 5_000_000,
    plazo: '12 a 48 meses',
    requisitos: ['2 años de operación', 'Estados financieros del último ejercicio', 'Buró sin atrasos > 30 días', 'Ventas anuales desde 2 MDP'],
    beneficios: ['Disposición en 72 h', 'Sin garantía hasta 3 MDP', 'Pagos fijos mensuales', 'Prepago sin penalización'],
    ideal: 'Empresas con ciclo de conversión largo que necesitan liquidez para inventario o nómina.',
  },
  {
    id: 'PRD-CRE-EQUIPO',
    nombre: 'Arrendamiento de Equipo',
    familia: 'Crédito',
    pitch: 'Renueva maquinaria sin descapitalizarte y deduce el 100% de la renta.',
    tasa: '16.2% anual equivalente',
    comision: '1.0% por apertura',
    montoMin: 300_000,
    montoMax: 12_000_000,
    plazo: '24 a 60 meses',
    requisitos: ['3 años de operación', 'Cotización del equipo', 'Enganche desde 10%'],
    beneficios: ['100% deducible', 'Conserva tus líneas de crédito', 'Opción de compra al final', 'Seguro del bien incluido'],
    ideal: 'Manufactura, construcción y transporte que renuevan activos productivos.',
  },
  {
    id: 'PRD-TDC-EMP',
    nombre: 'TDC Empresarial',
    familia: 'TDC',
    pitch: 'Control de gasto por colaborador con tarjetas ilimitadas y conciliación automática.',
    tasa: '32% anual sobre saldo revolvente',
    comision: 'Anualidad bonificable por consumo',
    montoMin: 50_000,
    montoMax: 2_000_000,
    plazo: 'Línea revolvente',
    requisitos: ['Cuenta de cheques activa', 'Buró empresarial sano', '1 año de operación'],
    beneficios: ['Tarjetas adicionales sin costo', 'Límites por usuario', '50 días sin intereses', 'Reporte de gastos exportable'],
    ideal: 'Empresas con equipo de ventas o compras en campo que necesitan control de gasto.',
  },
  {
    id: 'PRD-TPV-PLUS',
    nombre: 'TPV Plus',
    familia: 'TPV',
    pitch: 'Terminal con depósito el mismo día y tasa que baja conforme creces.',
    tasa: 'Comisión 1.75% – 2.5% por transacción',
    comision: 'Sin renta mensual con volumen > 80 mil',
    montoMin: 0,
    montoMax: 0,
    plazo: 'Sin plazo forzoso',
    requisitos: ['Cuenta de cheques', 'Acta constitutiva o alta SAT', 'Comprobante de domicilio del negocio'],
    beneficios: ['Depósito mismo día', 'Meses sin intereses', 'Cobro con QR y link de pago', 'Sin renta con volumen'],
    ideal: 'Comercios con alto flujo de tarjeta que hoy esperan 48 h por su dinero.',
  },
  {
    id: 'PRD-CHQ-EMP',
    nombre: 'Cuenta Empresarial Plus',
    familia: 'Cheques',
    pitch: 'Cuenta con rendimiento diario, transferencias ilimitadas y firmas mancomunadas.',
    tasa: 'Rendimiento 8.1% anual sobre saldo',
    comision: 'Sin comisión por manejo con saldo mínimo',
    montoMin: 25_000,
    montoMax: 0,
    plazo: 'Sin plazo',
    requisitos: ['Acta constitutiva', 'Poder del representante legal', 'Identificación de firmantes'],
    beneficios: ['SPEI ilimitado', 'Rendimiento diario', 'Hasta 8 firmantes', 'Banca en línea con roles'],
    ideal: 'Empresas que operan con múltiples firmantes y saldos ociosos.',
  },
  {
    id: 'PRD-SEG-EMP',
    nombre: 'Seguro Empresarial Integral',
    familia: 'Seguros',
    pitch: 'Protege inmueble, inventario y responsabilidad civil en una sola póliza.',
    tasa: 'Prima desde 0.35% del valor asegurado',
    comision: 'Pago anual o 12 meses sin intereses',
    montoMin: 500_000,
    montoMax: 80_000_000,
    plazo: 'Vigencia anual',
    requisitos: ['Inventario valuado', 'Inspección del inmueble', 'Sin siniestros graves en 24 meses'],
    beneficios: ['Cobertura de contenidos', 'Responsabilidad civil', 'Pérdidas consecuenciales', 'Asistencia 24/7'],
    ideal: 'Negocios con inventario o maquinaria concentrada en una sola ubicación.',
  },
  {
    id: 'PRD-NOM-EMP',
    nombre: 'Nómina Empresarial',
    familia: 'Nómina',
    pitch: 'Dispersión en minutos y beneficios bancarios para tus colaboradores.',
    tasa: 'Sin costo por dispersión',
    comision: 'Sin comisión con 20+ colaboradores',
    montoMin: 0,
    montoMax: 0,
    plazo: 'Sin plazo',
    requisitos: ['20 colaboradores mínimo', 'Cuenta empresarial activa', 'Layout de dispersión'],
    beneficios: ['Dispersión en minutos', 'Cuentas sin comisión al empleado', 'Crédito de nómina preaprobado', 'Portal de altas y bajas'],
    ideal: 'Empresas que hoy dispersan por transferencia manual o con otro banco.',
  },
]

// ── Playbooks (flash cards) ──────────────────────────────────────────────────
export const playbooks: Playbook[] = [
  {
    id: 'PB-01',
    categoria: 'Objeción',
    frente: '"Su tasa está más alta que la de mi banco actual."',
    reverso:
      'Reencuadra de tasa a costo total: suma comisiones por apertura, seguro obligatorio y penalización por prepago. Nuestro prepago es sin penalización, lo que en un crédito a 36 meses liquidado al mes 20 compensa hasta 2 puntos de tasa.',
    tip: 'Pide su tabla de amortización actual antes de responder. Sin números, la objeción no se puede desarmar.',
  },
  {
    id: 'PB-02',
    categoria: 'Objeción',
    frente: '"Déjame lo pienso y te llamo."',
    reverso:
      'Acepta la pausa pero ánclala: "Claro. ¿Qué necesitarías tener claro para decidir?" Anota la respuesta como criterio de decisión y agenda fecha concreta antes de colgar.',
    tip: 'Nunca cierres la llamada sin una fecha en el calendario. Un "te llamo" sin fecha equivale a un no.',
  },
  {
    id: 'PB-03',
    categoria: 'Descubrimiento',
    frente: '¿Cómo detecto necesidad de capital de trabajo?',
    reverso:
      'Tres señales: días de cuentas por cobrar arriba de 60, estacionalidad fuerte en su giro, y saldos en cuenta que caen a mínimos antes de cada quincena. Las tres son visibles en su historial transaccional.',
    tip: 'Pregunta "¿cuántos días tarda en cobrarle a su cliente más grande?" Es la pregunta que más ofertas de crédito abre.',
  },
  {
    id: 'PB-04',
    categoria: 'Cierre',
    frente: 'El cliente ya dijo que sí pero no firma.',
    reverso:
      'Casi siempre falta un tercero: socio, contador o cónyuge. Pregunta directamente quién más revisa el contrato y ofrece una llamada de 15 minutos con esa persona.',
    tip: 'Ofrece firmar por partes: expediente hoy, contrato cuando el socio revise. El avance parcial mantiene el momentum.',
  },
  {
    id: 'PB-05',
    categoria: 'Cumplimiento',
    frente: '¿Qué documentos NO pueden faltar en el expediente?',
    reverso:
      'Acta constitutiva con todas las reformas, poder vigente del representante legal, identificación oficial de firmantes, comprobante de domicilio menor a 3 meses y constancia de situación fiscal del ejercicio en curso.',
    tip: 'La constancia de situación fiscal vencida es la causa número uno de rechazo en mesa de control.',
  },
  {
    id: 'PB-06',
    categoria: 'Objeción',
    frente: '"Ahorita no es buen momento, el negocio está lento."',
    reverso:
      'Un negocio lento es el mejor momento para una línea preventiva: se autoriza con los estados financieros buenos del año pasado y se dispone cuando haga falta. Autorizar en crisis es mucho más caro.',
    tip: 'Vende la línea, no la disposición. "Ténla lista, úsala si la necesitas" baja la barrera enormemente.',
  },
]

// ── Generación de clientes ───────────────────────────────────────────────────
function rfcDe(nombre: string, tipo: TipoPersona): string {
  const letras = nombre
    .toUpperCase()
    .replace(/[^A-ZÑ ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .padEnd(3, 'X')
    .slice(0, tipo === 'PM' ? 3 : 4)
  const y = String(int(85, 18)).padStart(2, '0')
  const m = String(int(1, 12)).padStart(2, '0')
  const d = String(int(1, 28)).padStart(2, '0')
  const h = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
  return `${letras}${y}${m}${d}${pick(h.split(''))}${pick(h.split(''))}${int(0, 9)}`
}

function generarClientes(n: number): Cliente[] {
  const out: Cliente[] = []
  for (let i = 0; i < n; i++) {
    const esMoral = rnd() < 0.7
    const nombre = esMoral
      ? `${EMPRESAS[i % EMPRESAS.length]} ${pick(['S.A. de C.V.', 'S. de R.L.', 'S.A.P.I. de C.V.'])}`
      : PERSONAS[i % PERSONAS.length]!
    const tipo: TipoPersona = esMoral ? 'PM' : rnd() < 0.6 ? 'PFAE' : 'PF'
    const salud = int(28, 97)
    const facturacion = esMoral ? int(4, 180) * 1_000_000 : int(1, 14) * 1_000_000
    const diasUltimo = int(1, 140)
    out.push({
      id: `CLI-${String(i + 1).padStart(3, '0')}`,
      nombre,
      rfc: rfcDe(nombre, tipo),
      tipo,
      giro: pick(GIROS),
      ciudad: pick(CIUDADES),
      telefono: `81 ${int(1000, 9999)} ${int(1000, 9999)}`,
      email: `contacto@${nombre.split(' ')[0]!.toLowerCase().replace(/[^a-z]/g, '')}.mx`,
      contacto: esMoral ? pick(CONTACTOS) : nombre,
      puesto: esMoral ? pick(PUESTOS) : 'Titular',
      ejecutivo: i % 3 === 0 ? YO : pick(EJECUTIVOS),
      antiguedadMeses: int(3, 156),
      facturacionAnual: facturacion,
      saldoPromedio: Math.round(facturacion * (0.02 + rnd() * 0.09)),
      productos: [],
      salud,
      riesgoFuga: salud > 72 ? 'bajo' : salud > 48 ? 'medio' : 'alto',
      ultimoContacto: iso(addDays(HOY, -diasUltimo)),
      nps: int(3, 10),
    })
  }
  return out
}

export const clientes: Cliente[] = generarClientes(48)

// ── Generación de ofertas ────────────────────────────────────────────────────
const productosPorFamilia = productos.reduce<Record<string, Producto[]>>((acc, p) => {
  ;(acc[p.familia] ||= []).push(p)
  return acc
}, {})

const FAMILIAS: Familia[] = ['Crédito', 'TDC', 'TPV', 'Cheques', 'Seguros', 'Nómina']

const NOTAS_POR_ETAPA: Record<Etapa, string[]> = {
  Prospecto: ['Alta desde campaña, sin primer contacto.', 'Referido por cliente actual, falta llamar.'],
  Contactado: ['Primera llamada hecha, mostró interés general.', 'Pidió información por correo antes de reunirse.'],
  Calificado: ['Confirmó necesidad y presupuesto. Falta propuesta formal.', 'Validado buró y antigüedad, cumple política.'],
  Propuesta: ['Propuesta entregada, espera respuesta del consejo.', 'Cotización enviada, comparando con otra institución.'],
  Negociación: ['Pide mejorar tasa 1.5 puntos.', 'Negociando plazo y comisión de apertura.'],
  Ganada: ['Contrato firmado y recursos dispersados.', 'Cerrada con condiciones estándar.'],
  Perdida: ['Se fue con competencia por tasa.', 'Pospuso la inversión al siguiente ejercicio.'],
}

const PESO_ETAPA: Record<Etapa, number> = {
  Prospecto: 10,
  Contactado: 20,
  Calificado: 40,
  Propuesta: 60,
  Negociación: 78,
  Ganada: 100,
  Perdida: 0,
}

function generarOfertas(): Oferta[] {
  const out: Oferta[] = []
  let n = 1001
  for (const c of clientes) {
    const cuantas = int(1, 4)
    for (let k = 0; k < cuantas; k++) {
      const familia = pick(FAMILIAS)
      const prod = pick(productosPorFamilia[familia] ?? productos)
      const r = rnd()
      const etapa: Etapa =
        r < 0.1 ? 'Prospecto'
        : r < 0.24 ? 'Contactado'
        : r < 0.42 ? 'Calificado'
        : r < 0.6 ? 'Propuesta'
        : r < 0.75 ? 'Negociación'
        : r < 0.9 ? 'Ganada'
        : 'Perdida'
      const diasAlta = int(10, 210)
      const fechaAlta = addDays(HOY, -diasAlta)
      const cerrada = etapa === 'Ganada' || etapa === 'Perdida'
      const fechaCierre = cerrada ? addDays(fechaAlta, int(15, diasAlta)) : addDays(HOY, int(-12, 75))
      const base = familia === 'Crédito' ? int(4, 60) * 100_000 : int(3, 45) * 10_000
      out.push({
        id: `OF-${n++}`,
        clienteId: c.id,
        cliente: c.nombre,
        producto: prod.nombre,
        familia,
        monto: base,
        etapa,
        probabilidad: Math.max(0, Math.min(99, PESO_ETAPA[etapa] + int(-8, 8))),
        fechaAlta: iso(fechaAlta),
        fechaCierre: iso(fechaCierre),
        ejecutivo: c.ejecutivo,
        campana: pick(CAMPANAS),
        notas: pick(NOTAS_POR_ETAPA[etapa]),
        diasSinMover: cerrada ? 0 : int(1, 62),
      })
      if (!c.productos.includes(prod.nombre) && etapa === 'Ganada') c.productos.push(prod.nombre)
    }
  }
  return out
}

export const ofertas: Oferta[] = generarOfertas()

// Todo cliente debe mostrar al menos un producto contratado en su ficha.
for (const c of clientes) {
  if (c.productos.length === 0) c.productos.push('Cuenta Empresarial Plus')
}

// ── Tareas ───────────────────────────────────────────────────────────────────
const TITULOS_TAREA: Record<TipoTarea, string[]> = {
  llamada: ['Llamar para dar seguimiento a la propuesta', 'Llamada de calificación inicial', 'Confirmar recepción de documentos'],
  visita: ['Visita a planta para levantar requerimiento', 'Visita de cortesía y revisión de portafolio', 'Firma de contrato en sitio'],
  correo: ['Enviar cotización formal', 'Enviar comparativo contra oferta de competencia', 'Enviar checklist de expediente'],
  documento: ['Recolectar constancia de situación fiscal', 'Subir estados financieros a mesa de control', 'Validar poder del representante legal'],
  seguimiento: ['Dar seguimiento a autorización de crédito', 'Revisar avance de expediente', 'Confirmar fecha de dispersión'],
}

function generarTareas(): Tarea[] {
  const out: Tarea[] = []
  const abiertas = ofertas.filter((o) => ETAPAS_ABIERTAS.includes(o.etapa))
  let n = 1
  for (const o of abiertas) {
    if (rnd() > 0.45) continue
    const tipo = pick(['llamada', 'visita', 'correo', 'documento', 'seguimiento'] as TipoTarea[])
    const offset = int(-4, 14)
    out.push({
      id: `TAR-${String(n++).padStart(3, '0')}`,
      titulo: pick(TITULOS_TAREA[tipo]),
      tipo,
      clienteId: o.clienteId,
      ofertaId: o.id,
      vence: iso(addDays(HOY, offset)),
      prioridad: offset < 0 ? 'alta' : offset <= 2 ? 'alta' : offset <= 7 ? 'media' : 'baja',
      estado: rnd() < 0.18 ? 'hecha' : 'pendiente',
      responsable: o.ejecutivo,
    })
  }
  return out
}

export const tareas: Tarea[] = generarTareas()

// ── Actividades (línea de tiempo) ────────────────────────────────────────────
const ACTIVIDADES_BASE: { tipo: TipoActividad; titulo: string; detalle: string }[] = [
  { tipo: 'llamada', titulo: 'Llamada de seguimiento', detalle: 'Se revisó el estatus de la propuesta y se resolvieron dudas sobre el plazo.' },
  { tipo: 'correo', titulo: 'Cotización enviada', detalle: 'Se envió la propuesta formal con dos escenarios de plazo.' },
  { tipo: 'reunion', titulo: 'Reunión en oficinas del cliente', detalle: 'Se presentó el portafolio completo y se levantaron necesidades de liquidez.' },
  { tipo: 'nota', titulo: 'Nota del ejecutivo', detalle: 'El cliente comentó que su temporada fuerte inicia en octubre.' },
  { tipo: 'sistema', titulo: 'Cambio de etapa', detalle: 'La oferta avanzó de etapa tras validación de mesa de control.' },
  { tipo: 'contrato', titulo: 'Expediente recibido', detalle: 'Se recibió documentación completa y se turnó a formalización.' },
]

function generarActividades(): Actividad[] {
  const out: Actividad[] = []
  let n = 1
  for (const c of clientes) {
    const ofertasCliente = ofertas.filter((o) => o.clienteId === c.id)
    const cuantas = int(3, 7)
    for (let i = 0; i < cuantas; i++) {
      const base = pick(ACTIVIDADES_BASE)
      out.push({
        id: `ACT-${String(n++).padStart(4, '0')}`,
        clienteId: c.id,
        ofertaId: ofertasCliente.length ? pick(ofertasCliente).id : undefined,
        tipo: base.tipo,
        titulo: base.titulo,
        detalle: base.detalle,
        fecha: iso(addDays(HOY, -int(1, 240))),
        autor: c.ejecutivo,
      })
    }
  }
  return out.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

export const actividades: Actividad[] = generarActividades()

// ── Utilidades de acceso ─────────────────────────────────────────────────────
export const clientePorId = (id: string) => clientes.find((c) => c.id === id)
export const ofertaPorId = (id: string) => ofertas.find((o) => o.id === id)

export function buscarClientes(termino: string): Cliente[] {
  const q = termino.toLowerCase().trim()
  if (!q) return []
  return clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(q) ||
      c.rfc.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.giro.toLowerCase().includes(q) ||
      c.ciudad.toLowerCase().includes(q) ||
      c.contacto.toLowerCase().includes(q)
  )
}

export const diasHasta = (fechaIso: string) =>
  Math.round((new Date(fechaIso + 'T00:00:00').getTime() - HOY.getTime()) / 86_400_000)

export const formatoMoneda = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

export const formatoFecha = (fechaIso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(fechaIso + 'T00:00:00')
  )

export const formatoFechaCorta = (fechaIso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(new Date(fechaIso + 'T00:00:00'))
