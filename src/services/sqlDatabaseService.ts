/**
 * Servicio de base de datos SQL usando sql.js (SQLite en WebAssembly)
 * 
 * Este servicio:
 * 1. Inicializa SQLite en el navegador
 * 2. Crea las tablas del modelo de datos
 * 3. Carga los datos existentes
 * 4. Ejecuta queries SQL con validación de seguridad
 */

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'

// Singleton para la instancia de SQL.js
let SQL: SqlJsStatic | null = null
let db: Database | null = null
let isInitialized = false
let initPromise: Promise<void> | null = null

// URLs de los archivos WASM de sql.js
const SQL_WASM_URL = 'https://sql.js.org/dist/sql-wasm.wasm'

/**
 * Inicializa sql.js y crea la base de datos
 */
export async function inicializarBaseDatos(): Promise<void> {
  if (isInitialized && db) return
  
  if (initPromise) {
    await initPromise
    return
  }
  
  initPromise = (async () => {
    try {
      console.log('Inicializando sql.js...')
      
      SQL = await initSqlJs({
        locateFile: () => SQL_WASM_URL
      })
      
      db = new SQL.Database()
      
      // Crear esquema de tablas
      crearEsquema()
      
      // Cargar datos
      await cargarDatos()
      
      isInitialized = true
      console.log('Base de datos SQLite inicializada correctamente')
    } catch (error) {
      console.error('Error inicializando sql.js:', error)
      throw error
    }
  })()
  
  await initPromise
}

/**
 * Crea el esquema de tablas
 */
function crearEsquema(): void {
  if (!db) throw new Error('Base de datos no inicializada')
  
  // Tabla clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      ide TEXT PRIMARY KEY,
      rfc TEXT,
      nombre TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      tipoPersona TEXT,
      numeroPromotor TEXT
    )
  `)
  
  // Tabla promotores
  db.run(`
    CREATE TABLE IF NOT EXISTS promotores (
      numeroPromotor TEXT PRIMARY KEY,
      nombre TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      activo INTEGER,
      banco TEXT,
      territorio TEXT,
      region TEXT,
      sucursalEquipo TEXT
    )
  `)
  
  // Tabla TDC (Tarjetas de Crédito)
  db.run(`
    CREATE TABLE IF NOT EXISTS tdc (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      numeroLinea TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      fechaVencimiento TEXT,
      producto TEXT,
      lineaTotal REAL,
      lineaDisponible REAL,
      lineaUso REAL,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla teléfonos
  db.run(`
    CREATE TABLE IF NOT EXISTS telefonos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      telefono TEXT,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla correos
  db.run(`
    CREATE TABLE IF NOT EXISTS correos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      correo TEXT,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla direcciones
  db.run(`
    CREATE TABLE IF NOT EXISTS direcciones (
      ide TEXT PRIMARY KEY,
      calle TEXT,
      numero TEXT,
      cp TEXT,
      colonia TEXT,
      municipio TEXT,
      estado TEXT,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla Cheques (Cuentas de Nómina)
  db.run(`
    CREATE TABLE IF NOT EXISTS cheques (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      numeroLinea TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      producto TEXT,
      saldoLinea REAL,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla TPV (Terminal Punto de Venta)
  db.run(`
    CREATE TABLE IF NOT EXISTS tpv (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      numeroLinea TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      producto TEXT,
      saldoFacturacion REAL,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla Variaciones Cheques (Movimientos)
  db.run(`
    CREATE TABLE IF NOT EXISTS variacionescheques (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      numeroLinea TEXT,
      fechaMovimiento TEXT,
      montoAnterior REAL,
      montoActual REAL,
      montoMovimiento REAL,
      FOREIGN KEY (ide) REFERENCES clientes(ide),
      FOREIGN KEY (numeroLinea) REFERENCES cheques(numeroLinea)
    )
  `)
  
  // Tabla Prospectos
  db.run(`
    CREATE TABLE IF NOT EXISTS prospectos (
      idProspecto TEXT PRIMARY KEY,
      rfc TEXT,
      tipoPersona TEXT,
      fechaAlta TEXT,
      fechaConversion TEXT,
      ide TEXT,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla Teléfonos Prospecto
  db.run(`
    CREATE TABLE IF NOT EXISTS telefonosprospecto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idProspecto TEXT,
      telefono TEXT,
      FOREIGN KEY (idProspecto) REFERENCES prospectos(idProspecto)
    )
  `)
  
  // Tabla Correos Prospecto
  db.run(`
    CREATE TABLE IF NOT EXISTS correosprospecto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idProspecto TEXT,
      correo TEXT,
      FOREIGN KEY (idProspecto) REFERENCES prospectos(idProspecto)
    )
  `)
  
  // Tabla Direcciones Prospecto
  db.run(`
    CREATE TABLE IF NOT EXISTS direccionesprospecto (
      idProspecto TEXT PRIMARY KEY,
      calle TEXT,
      numero TEXT,
      cp TEXT,
      colonia TEXT,
      municipio TEXT,
      estado TEXT,
      FOREIGN KEY (idProspecto) REFERENCES prospectos(idProspecto)
    )
  `)
  
  // Tabla Ofertas Prospectos
  db.run(`
    CREATE TABLE IF NOT EXISTS ofertasprospectos (
      idOferta TEXT PRIMARY KEY,
      idProspecto TEXT,
      numeroPromotor TEXT,
      familiaProducto TEXT,
      productoInteres TEXT,
      descripcionOferta TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      etapa TEXT,
      campaña TEXT,
      montoInteres REAL,
      idOportunidad TEXT,
      FOREIGN KEY (idProspecto) REFERENCES prospectos(idProspecto),
      FOREIGN KEY (numeroPromotor) REFERENCES promotores(numeroPromotor)
    )
  `)
  
  // Tabla Ofertas Clientes
  db.run(`
    CREATE TABLE IF NOT EXISTS ofertasclientes (
      idOferta TEXT PRIMARY KEY,
      ide TEXT,
      numeroPromotor TEXT,
      familiaProducto TEXT,
      productoInteres TEXT,
      descripcionOferta TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      etapa TEXT,
      campaña TEXT,
      montoOferta REAL,
      idOportunidad TEXT,
      montoTimbrado REAL,
      fechaTimbrado TEXT,
      FOREIGN KEY (ide) REFERENCES clientes(ide),
      FOREIGN KEY (numeroPromotor) REFERENCES promotores(numeroPromotor)
    )
  `)
  
  // Tabla Nóminas
  db.run(`
    CREATE TABLE IF NOT EXISTS nominas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      numeroLinea TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      producto TEXT,
      montoNomina REAL,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla Créditos
  db.run(`
    CREATE TABLE IF NOT EXISTS creditos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      numeroLinea TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      fechaVencimiento TEXT,
      producto TEXT,
      montoCredito REAL,
      saldoActual REAL,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  // Tabla Seguros
  db.run(`
    CREATE TABLE IF NOT EXISTS seguros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ide TEXT,
      numeroPoliza TEXT,
      fechaAlta TEXT,
      fechaBaja TEXT,
      fechaVencimiento TEXT,
      producto TEXT,
      primaAnual REAL,
      FOREIGN KEY (ide) REFERENCES clientes(ide)
    )
  `)
  
  console.log('Esquema de tablas creado')
}

/**
 * Carga los datos desde los data stores existentes
 */
/**
 * Fecha base de la aplicación. Se usa la fecha REAL del sistema para que los
 * vencimientos generados sean coherentes con `date('now')` en las consultas SQL.
 * Devuelve una fecha ISO (YYYY-MM-DD) desplazada N días respecto a esta base.
 */
const FECHA_BASE = new Date()
function fechaRelativaDias(dias: number): string {
  const d = new Date(FECHA_BASE)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

/**
 * Genera una fecha de vencimiento "interesante" para el demo: distribuye los
 * registros de forma que una parte venza en los próximos 30/60/90 días y el
 * resto más adelante. Determinista por índice para resultados estables.
 */
function vencimientoDemo(idx: number): string {
  const buckets = [12, 25, 45, 75, 120, 200, 320, 540]
  return fechaRelativaDias(buckets[idx % buckets.length]!)
}

async function cargarDatos(): Promise<void> {
  if (!db) throw new Error('Base de datos no inicializada')
  
  // Importar datos dinámicamente para evitar dependencias circulares
  const { clientes, tdc, telefonos, correos, direcciones } = await import('@/data')
  
  console.log('Cargando datos a SQLite...')
  
  // Insertar clientes
  const stmtClientes = db.prepare(`
    INSERT INTO clientes (ide, rfc, nombre, fechaAlta, fechaBaja, tipoPersona, numeroPromotor)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  
  clientes.forEach((c) => {
    stmtClientes.run([c.ide, c.rfc, c.nombreRazonSocial, c.fechaAlta, c.fechaBaja || null, c.tipoPersona, c.numeroPromotor])
  })
  stmtClientes.free()
  console.log(`  - ${clientes.length} clientes cargados`)
  
  // Insertar TDC - mapear campos de ProductoTDC a estructura SQL
  const stmtTdc = db.prepare(`
    INSERT INTO tdc (ide, numeroLinea, fechaAlta, fechaBaja, fechaVencimiento, producto, lineaTotal, lineaDisponible, lineaUso)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  tdc.forEach((t, idx) => {
    // Mapear nombres de ProductoTDC a nombres de tabla SQL
    const producto = (t as { nombreProducto?: string }).nombreProducto || 'Tarjeta Clasica'
    const lineaTotal = (t as { montoLineaTotal?: number }).montoLineaTotal || 0
    const lineaDisponible = (t as { montoLineaDisponible?: number }).montoLineaDisponible || 0
    const lineaUso = (t as { montoLineaUso?: number }).montoLineaUso || 0
    const fechaVencimiento = t.fechaBaja ? null : vencimientoDemo(idx)

    stmtTdc.run([t.ide, t.numeroLinea, t.fechaAlta, t.fechaBaja || null, fechaVencimiento, producto, lineaTotal, lineaDisponible, lineaUso])
  })
  stmtTdc.free()
  console.log(`  - ${tdc.length} TDC cargadas`)
  
  // Insertar teléfonos
  const stmtTel = db.prepare(`INSERT INTO telefonos (ide, telefono) VALUES (?, ?)`)
  telefonos.forEach((t) => {
    stmtTel.run([t.ide, t.telefono])
  })
  stmtTel.free()
  console.log(`  - ${telefonos.length} teléfonos cargados`)
  
  // Insertar correos
  const stmtCorreo = db.prepare(`INSERT INTO correos (ide, correo) VALUES (?, ?)`)
  correos.forEach((c) => {
    stmtCorreo.run([c.ide, c.correo])
  })
  stmtCorreo.free()
  console.log(`  - ${correos.length} correos cargados`)
  
  // Insertar direcciones
  const stmtDir = db.prepare(`
    INSERT INTO direcciones (ide, calle, numero, cp, colonia, municipio, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  direcciones.forEach((d) => {
    stmtDir.run([d.ide, d.calle, d.numero, d.cp, d.colonia, d.municipio, d.estado])
  })
  stmtDir.free()
  console.log(`  - ${direcciones.length} direcciones cargadas`)
  
  // Insertar Cheques
  const { cheques, tpv, variacionescheques } = await import('@/data')
  
  const stmtCheques = db.prepare(`
    INSERT INTO cheques (ide, numeroLinea, fechaAlta, fechaBaja, producto, saldoLinea)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  cheques.forEach((c: { ide: number; numeroLinea: string; fechaAlta: string; fechaBaja?: string; nombreProducto: string; saldoLinea: number }) => {
    stmtCheques.run([c.ide, c.numeroLinea, c.fechaAlta, c.fechaBaja || null, c.nombreProducto, c.saldoLinea])
  })
  stmtCheques.free()
  console.log(`  - ${cheques.length} cuentas de cheques cargadas`)
  
  // Insertar TPV
  const stmtTpv = db.prepare(`
    INSERT INTO tpv (ide, numeroLinea, fechaAlta, fechaBaja, producto, saldoFacturacion)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  tpv.forEach((t: { ide: number; numeroLinea: string; fechaAlta: string; fechaBaja?: string; nombreProducto: string; saldoFacturacion: number }) => {
    stmtTpv.run([t.ide, t.numeroLinea, t.fechaAlta, t.fechaBaja || null, t.nombreProducto, t.saldoFacturacion])
  })
  stmtTpv.free()
  console.log(`  - ${tpv.length} TPV cargadas`)
  
  // Insertar Variaciones de Cheques
  const stmtVar = db.prepare(`
    INSERT INTO variacionescheques (ide, numeroLinea, fechaMovimiento, montoAnterior, montoActual, montoMovimiento)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  variacionescheques.forEach((v: { ide: number; numeroLinea: string; fechaMovimiento: string; montoAnterior: number; montoActual: number; montoMovimiento: number }) => {
    stmtVar.run([v.ide, v.numeroLinea, v.fechaMovimiento, v.montoAnterior, v.montoActual, v.montoMovimiento])
  })
  stmtVar.free()
  console.log(`  - ${variacionescheques.length} variaciones de cheques cargadas`)
  
  // Generar datos de ejemplo para Nóminas (usando algunos clientes existentes)
  const clienteIdes = clientes.map((c: { ide: number }) => c.ide)
  const nominasData = clienteIdes.slice(0, 30).map((ide: number, idx: number) => ({
    ide,
    numeroLinea: `NOM${String(idx + 1).padStart(6, '0')}`,
    fechaAlta: '2023-01-15',
    fechaBaja: '' as string,
    producto: ['Nómina Básica', 'Nómina Plus', 'Nómina Empresarial'][idx % 3]!,
    montoNomina: 15000 + Math.random() * 50000
  }))
  
  const stmtNom = db.prepare(`
    INSERT INTO nominas (ide, numeroLinea, fechaAlta, fechaBaja, producto, montoNomina)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  nominasData.forEach(n => {
    stmtNom.run([n.ide, n.numeroLinea, n.fechaAlta, n.fechaBaja, n.producto, n.montoNomina])
  })
  stmtNom.free()
  console.log(`  - ${nominasData.length} nóminas cargadas`)
  
  // Generar datos de ejemplo para Créditos
  const creditosData = clienteIdes.slice(10, 40).map((ide: number, idx: number) => ({
    ide,
    numeroLinea: `CRE${String(idx + 1).padStart(6, '0')}`,
    fechaAlta: '2022-06-01',
    fechaBaja: '' as string,
    producto: ['Crédito Personal', 'Crédito Hipotecario', 'Crédito Automotriz', 'Crédito PYME'][idx % 4]!,
    montoCredito: 100000 + Math.random() * 500000,
    saldoActual: 50000 + Math.random() * 300000,
    fechaVencimiento: vencimientoDemo(idx + 2)
  }))

  const stmtCred = db.prepare(`
    INSERT INTO creditos (ide, numeroLinea, fechaAlta, fechaBaja, fechaVencimiento, producto, montoCredito, saldoActual)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  creditosData.forEach(c => {
    stmtCred.run([c.ide, c.numeroLinea, c.fechaAlta, c.fechaBaja, c.fechaVencimiento, c.producto, c.montoCredito, c.saldoActual])
  })
  stmtCred.free()
  console.log(`  - ${creditosData.length} créditos cargados`)
  
  // Generar datos de ejemplo para Seguros
  const segurosData = clienteIdes.slice(5, 25).map((ide: number, idx: number) => ({
    ide,
    numeroPoliza: `POL${String(idx + 1).padStart(8, '0')}`,
    fechaAlta: '2023-03-01',
    fechaBaja: '' as string,
    producto: ['Seguro de Vida', 'Seguro de Auto', 'Seguro de Gastos Médicos', 'Seguro de Hogar'][idx % 4]!,
    primaAnual: 5000 + Math.random() * 20000,
    fechaVencimiento: vencimientoDemo(idx + 4)
  }))

  const stmtSeg = db.prepare(`
    INSERT INTO seguros (ide, numeroPoliza, fechaAlta, fechaBaja, fechaVencimiento, producto, primaAnual)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  segurosData.forEach(s => {
    stmtSeg.run([s.ide, s.numeroPoliza, s.fechaAlta, s.fechaBaja, s.fechaVencimiento, s.producto, s.primaAnual])
  })
  stmtSeg.free()
  console.log(`  - ${segurosData.length} seguros cargados`)
  
  // Insertar Promotores
  const { promotores } = await import('@/data')
  
  const stmtProm = db.prepare(`
    INSERT INTO promotores (numeroPromotor, nombre, fechaAlta, fechaBaja, activo, banco, territorio, region, sucursalEquipo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  promotores.forEach((p: { numeroPromotor: string; nombre: string; fechaAlta: string; fechaBaja?: string; activo: boolean; banco: string; territorio: string; region: string; sucursalEquipo: string }) => {
    stmtProm.run([p.numeroPromotor, p.nombre, p.fechaAlta, p.fechaBaja || null, p.activo ? 1 : 0, p.banco, p.territorio, p.region, p.sucursalEquipo])
  })
  stmtProm.free()
  console.log(`  - ${promotores.length} promotores cargados`)
  
  // Insertar Prospectos
  const { prospectos } = await import('@/data')
  
  const stmtProsp = db.prepare(`
    INSERT INTO prospectos (idProspecto, rfc, tipoPersona, fechaAlta, fechaConversion, ide)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  prospectos.forEach((p: { idProspecto: string; rfc: string; tipoPersona: string; fechaAlta: string; fechaConversion?: string; ide?: number }) => {
    stmtProsp.run([p.idProspecto, p.rfc, p.tipoPersona, p.fechaAlta, p.fechaConversion || null, p.ide || null])
  })
  stmtProsp.free()
  console.log(`  - ${prospectos.length} prospectos cargados`)
  
  // Insertar Contactabilidad de Prospectos
  const { telefonosprospecto, correosprospecto, direccionesprospecto } = await import('@/data')
  
  // Teléfonos Prospecto
  const stmtTelProsp = db.prepare(`INSERT INTO telefonosprospecto (idProspecto, telefono) VALUES (?, ?)`)
  telefonosprospecto.forEach((t: { idProspecto: string; telefono: string }) => {
    stmtTelProsp.run([t.idProspecto, t.telefono])
  })
  stmtTelProsp.free()
  console.log(`  - ${telefonosprospecto.length} teléfonos de prospectos cargados`)
  
  // Correos Prospecto
  const stmtCorProsp = db.prepare(`INSERT INTO correosprospecto (idProspecto, correo) VALUES (?, ?)`)
  correosprospecto.forEach((c: { idProspecto: string; correo: string }) => {
    stmtCorProsp.run([c.idProspecto, c.correo])
  })
  stmtCorProsp.free()
  console.log(`  - ${correosprospecto.length} correos de prospectos cargados`)
  
  // Direcciones Prospecto
  const stmtDirProsp = db.prepare(`
    INSERT INTO direccionesprospecto (idProspecto, calle, numero, cp, colonia, municipio, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  direccionesprospecto.forEach((d: { idProspecto: string; calle: string; numero: string; cp: string; colonia: string; municipio: string; estado: string }) => {
    stmtDirProsp.run([d.idProspecto, d.calle, d.numero, d.cp, d.colonia, d.municipio, d.estado])
  })
  stmtDirProsp.free()
  console.log(`  - ${direccionesprospecto.length} direcciones de prospectos cargadas`)
  
  // Insertar Ofertas Prospectos
  const { ofertasprospectos } = await import('@/data')
  
  const stmtOfert = db.prepare(`
    INSERT INTO ofertasprospectos (idOferta, idProspecto, numeroPromotor, familiaProducto, productoInteres, descripcionOferta, fechaAlta, fechaBaja, etapa, campaña, montoInteres, idOportunidad)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  ofertasprospectos.forEach((o: { idOferta: string; idProspecto: string; numeroPromotor: string; familiaProducto: string; productoInteres: string; descripcionOferta: string; fechaAlta: string; fechaBaja?: string; etapa: string; campaña: string; montoInteres: number; idOportunidad?: string }) => {
    stmtOfert.run([o.idOferta, o.idProspecto, o.numeroPromotor, o.familiaProducto, o.productoInteres, o.descripcionOferta, o.fechaAlta, o.fechaBaja || null, o.etapa, o.campaña, o.montoInteres, o.idOportunidad || null])
  })
  stmtOfert.free()
  console.log(`  - ${ofertasprospectos.length} ofertas de prospectos cargadas`)
  
  // Insertar Ofertas Clientes
  const { ofertasclientes } = await import('@/data')
  
  const stmtOfertCli = db.prepare(`
    INSERT INTO ofertasclientes (idOferta, ide, numeroPromotor, familiaProducto, productoInteres, descripcionOferta, fechaAlta, fechaBaja, etapa, campaña, montoOferta, idOportunidad, montoTimbrado, fechaTimbrado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  ofertasclientes.forEach((o: { idOferta: string; ide: number; numeroPromotor: string; familiaProducto: string; productoInteres: string; descripcionOferta: string; fechaAlta: string; fechaBaja?: string; etapa: string; campaña: string; montoOferta: number; idOportunidad?: string; montoTimbrado?: number; fechaTimbrado?: string }) => {
    stmtOfertCli.run([o.idOferta, o.ide, o.numeroPromotor, o.familiaProducto, o.productoInteres, o.descripcionOferta, o.fechaAlta, o.fechaBaja || null, o.etapa, o.campaña, o.montoOferta, o.idOportunidad || null, o.montoTimbrado || null, o.fechaTimbrado || null])
  })
  stmtOfertCli.free()
  console.log(`  - ${ofertasclientes.length} ofertas de clientes cargadas`)
  
  console.log('Datos cargados exitosamente')
}

/**
 * Valida que el SQL sea solo SELECT (no modificaciones)
 */
function validarSQL(sql: string): { valido: boolean; error?: string } {
  const sqlLimpio = sql.trim().toUpperCase()
  
  // Palabras clave prohibidas
  const prohibidas = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'EXEC', 'EXECUTE']
  
  for (const palabra of prohibidas) {
    if (sqlLimpio.startsWith(palabra)) {
      return { valido: false, error: `Operación ${palabra} no permitida` }
    }
  }
  
  // Permitir SELECT y WITH (CTE - Common Table Expression)
  if (!sqlLimpio.startsWith('SELECT') && !sqlLimpio.startsWith('WITH')) {
    return { valido: false, error: 'Solo se permiten consultas SELECT' }
  }
  
  return { valido: true }
}

/**
 * Ejecuta una consulta SQL y retorna los resultados
 */
export interface SQLResult {
  exito: boolean
  datos: Record<string, unknown>[]
  columnas: string[]
  total: number
  error?: string
  sql: string
}

export async function ejecutarSQL(sql: string): Promise<SQLResult> {
  // Asegurar que la BD esté inicializada
  await inicializarBaseDatos()
  
  if (!db) {
    return {
      exito: false,
      datos: [],
      columnas: [],
      total: 0,
      error: 'Base de datos no inicializada',
      sql
    }
  }
  
  // Validar SQL
  const validacion = validarSQL(sql)
  if (!validacion.valido) {
    return {
      exito: false,
      datos: [],
      columnas: [],
      total: 0,
      error: validacion.error,
      sql
    }
  }
  
  try {
    console.log('Ejecutando SQL:', sql)
    
    const resultado = db.exec(sql)
    
    if (resultado.length === 0) {
      return {
        exito: true,
        datos: [],
        columnas: [],
        total: 0,
        sql
      }
    }
    
    const firstResult = resultado[0]!
    const columns = firstResult.columns
    const values = firstResult.values
    
    // Convertir a array de objetos
    const datos = values.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col: string, idx: number) => {
        obj[col] = row[idx]
      })
      return obj
    })
    
    console.log(`SQL ejecutado: ${datos.length} resultados`)
    
    return {
      exito: true,
      datos,
      columnas: columns,
      total: datos.length,
      sql
    }
  } catch (error) {
    console.error('Error ejecutando SQL:', error)
    return {
      exito: false,
      datos: [],
      columnas: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Error desconocido',
      sql
    }
  }
}

/**
 * Obtiene el esquema de la base de datos para el prompt del AI
 */
export function obtenerEsquemaSQL(): string {
  return `
ESQUEMA (SQLite). fechaBaja IS NULL = registro ACTIVO. Fechas en formato 'YYYY-MM-DD'.

clientes(ide PK, rfc, nombre, fechaAlta, fechaBaja, tipoPersona, numeroPromotor)
  - tipoPersona: "Persona Fisica" | "Persona Moral" | "Persona Fisica con Actividad Empresarial"
promotores(numeroPromotor PK, nombre, fechaAlta, fechaBaja, activo, banco, territorio, region, sucursalEquipo)
tdc(id, ide FK, numeroLinea, fechaAlta, fechaBaja, fechaVencimiento, producto, lineaTotal, lineaDisponible, lineaUso)
  - lineaUso = saldo dispuesto (genera intereses). fechaVencimiento = vencimiento de la línea/plástico.
cheques(id, ide FK, numeroLinea, fechaAlta, fechaBaja, producto, saldoLinea)  -- captación a la vista
tpv(id, ide FK, numeroLinea, fechaAlta, fechaBaja, producto, saldoFacturacion)  -- facturación con terminal
nominas(id, ide FK, numeroLinea, fechaAlta, fechaBaja, producto, montoNomina)
creditos(id, ide FK, numeroLinea, fechaAlta, fechaBaja, fechaVencimiento, producto, montoCredito, saldoActual)
seguros(id, ide FK, numeroPoliza, fechaAlta, fechaBaja, fechaVencimiento, producto, primaAnual)
variacionescheques(id, ide FK, numeroLinea FK->cheques, fechaMovimiento, montoAnterior, montoActual, montoMovimiento)
  - montoMovimiento > 0 = ingreso, < 0 = egreso
direcciones(ide PK/FK, calle, numero, cp, colonia, municipio, estado)
telefonos(id, ide FK, telefono) · correos(id, ide FK, correo)
prospectos(idProspecto PK, rfc, tipoPersona, fechaAlta, fechaConversion, ide FK)
ofertasclientes(idOferta PK, ide FK, numeroPromotor FK, familiaProducto, productoInteres, fechaAlta, fechaBaja, etapa, campaña, montoOferta, idOportunidad, montoTimbrado, fechaTimbrado)
ofertasprospectos(idOferta PK, idProspecto FK, numeroPromotor FK, familiaProducto, productoInteres, fechaAlta, fechaBaja, etapa, campaña, montoInteres, idOportunidad)

RELACIONES: casi todo une por "ide" con clientes. variacionescheques.numeroLinea -> cheques.numeroLinea. prospectos por idProspecto.

RENTABILIDAD ANUAL ESTIMADA (margen) por cliente — usar estos coeficientes en SQL:
  TDC:       SUM(tdc.lineaUso)        * 0.30
  Créditos:  SUM(creditos.saldoActual)* 0.18
  Cheques:   SUM(cheques.saldoLinea)  * 0.04
  TPV:       SUM(tpv.saldoFacturacion)* 0.012
  Seguros:   SUM(seguros.primaAnual)  * 0.20
  Nóminas:   SUM(nominas.montoNomina) * 0.02
  Rentabilidad total = suma de los anteriores (solo registros activos, fechaBaja IS NULL).
`
}


/**
 * Obtiene el detalle completo de un cliente por su IDE
 */
export async function obtenerDetalleCliente(ide: string): Promise<Record<string, unknown> | null> {
  // Asegurar que la BD esté inicializada
  await inicializarBaseDatos()
  
  if (!db) return null
  
  try {
    // 1. Obtener datos básicos del cliente
    const sqlCliente = `SELECT * FROM clientes WHERE ide = '${ide}'`
    const resCliente = db.exec(sqlCliente)
    
    if (!resCliente.length || !resCliente[0]?.values.length) return null
    
    const clienteCols = resCliente[0].columns
    const clienteVals = resCliente[0].values[0]
    const cliente: Record<string, unknown> = {}
    
    if (clienteVals) {
      clienteCols.forEach((col, i) => {
        cliente[col] = clienteVals[i]
      })
    }
    
    // 2. Obtener teléfonos
    const sqlTel = `SELECT telefono FROM telefonos WHERE ide = '${ide}'`
    const resTel = db.exec(sqlTel)
    const telefonos = (resTel.length && resTel[0]?.values) ? resTel[0].values.map(v => v[0]) : []
    
    // 3. Obtener correos
    const sqlCorreo = `SELECT correo FROM correos WHERE ide = '${ide}'`
    const resCorreo = db.exec(sqlCorreo)
    const correos = (resCorreo.length && resCorreo[0]?.values) ? resCorreo[0].values.map(v => v[0]) : []
    
    // 4. Obtener direcciones
    const sqlDir = `SELECT * FROM direcciones WHERE ide = '${ide}'`
    const resDir = db.exec(sqlDir)
    const direcciones: Record<string, unknown>[] = []
    
    if (resDir.length && resDir[0]?.values) {
      const dirCols = resDir[0].columns
      resDir[0].values.forEach(vals => {
        const dir: Record<string, unknown> = {}
        dirCols.forEach((col, i) => {
          dir[col] = vals[i]
        })
        direcciones.push(dir)
      })
    }
    
    return {
      ...cliente,
      telefonos,
      correos,
      direcciones
    }
  } catch (error) {
    console.error('Error obteniendo detalle cliente:', error)
    return null
  }
}
