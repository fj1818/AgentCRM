/**
 * Datos semilla embebidos (sin Google Sheets). Generados de forma determinista
 * para la demo: clientes/prospectos, ofertas, contratos y catálogos.
 */

var FAMILIAS_ = ['Cuenta de Cheques', 'Tarjeta de Crédito', 'TPV', 'Crédito Personal', 'Seguros', 'Nómina', 'Inversión'];
var ETAPAS_CLI_ = ['No contactado', 'Interesado', 'Negociación', 'Fabrica', 'Entregado', 'Timbrado'];
var ETAPAS_PROS_ = ['No contactado', 'En negociación', 'Interesado', 'Convertido'];
var SEGMENTOS_ = ['Patrimonial', 'Empresarial', 'PyME', 'Personal'];
var NOMBRES_ = [
  'Roberto Cano Lugo', 'Gabriela Ortiz Mena', 'Grupo Aurora SA de CV', 'María García López',
  'Comercializadora del Norte', 'Carlos Ruiz Díaz', 'Ana Sofía Martínez', 'Servicios Integrales SA',
  'Jorge Fernández', 'Distribuidora Mexicana', 'Lucía Díaz Robles', 'Tecnología Avanzada SA'
];
var EJECUTIVOS_ = ['Ana López', 'Carlos Ruiz', 'María García', 'Luis Hernández'];

// Catálogos para el detalle de oferta (selects dependientes)
var PRODUCTOS_POR_FAMILIA_ = {
  'Cuenta de Cheques': ['Cuenta Básica', 'Cuenta Premium', 'Cuenta Nómina'],
  'Tarjeta de Crédito': ['Tarjeta Clásica', 'Tarjeta Oro', 'Tarjeta Platino', 'Tarjeta Empresarial'],
  'TPV': ['TPV Básico', 'TPV Plus', 'TPV Premium'],
  'Crédito Personal': ['Crédito Personal', 'Crédito Express', 'Crédito Auto'],
  'Seguros': ['Seguro de Vida', 'Seguro Auto', 'Seguro Hogar'],
  'Nómina': ['Nómina Básica', 'Nómina Total', 'Nómina Plus'],
  'Inversión': ['Pagaré', 'Fondo de Inversión', 'CEDE']
};
var SUBETAPAS_POR_ETAPA_ = {
  'No contactado': ['Pendiente', 'Reintento'],
  'Interesado': ['Información enviada', 'Cita agendada'],
  'Negociación': ['Propuesta enviada', 'En revisión'],
  'En negociación': ['Propuesta enviada', 'En revisión'],
  'Fabrica': ['En proceso', 'Validación'],
  'Entregado': ['Documentación', 'Firma'],
  'Timbrado': ['Completado'],
  'Convertido': ['Activación'],
  'Descartado': ['Sin interés', 'No elegible', 'Competencia']
};
var CAMPANAS_ = ['Captación PyME 2025', 'Nómina Total', 'Verano de Tasas', 'Renovación TDC'];
var ORIGENES_ = ['Campaña', 'Sucursal', 'Referido', 'Inbound', 'Telemarketing'];

function rng_(seed) {
  var a = seed >>> 0;
  return function () { a = (a + 0x6d2b79f5) >>> 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function pick_(r, arr) { return arr[Math.floor(r() * arr.length)]; }
function intr_(r, a, b) { return Math.floor(r() * (b - a + 1)) + a; }
function pad_(n, w) { var s = '' + n; while (s.length < w) s = '0' + s; return s; }
function fecha_(r, y0, y1) { return pad_(intr_(r, 1, 28), 2) + '/' + pad_(intr_(r, 1, 12), 2) + '/' + intr_(r, y0, y1); }
function money_(n) { return '$' + Number(n || 0).toLocaleString('en-US'); }

function getSeedData() {
  var clientes = [];
  var ofertas = [];
  var rfcPrefijos = ['ANAL', 'CARL', 'MARG', 'GRPA', 'COMN', 'CRUZ', 'MART', 'SERV', 'FERN', 'DIST', 'DIAZ', 'TECA'];

  for (var i = 0; i < NOMBRES_.length; i++) {
    var r = rng_(1000 + i * 7);
    var rfc = rfcPrefijos[i] + pad_(intr_(r, 100000, 999999), 6) + 'X' + intr_(r, 0, 9);
    var esCliente = (i % 2 === 0); // mitad clientes, mitad prospectos
    var tipoPersona = pick_(r, ['Persona Fisica', 'Persona Moral', 'Persona Fisica con Actividad Empresarial']);
    var nombre = NOMBRES_[i];

    var contratos = [];
    var campanas = [];
    var variaciones = [], ingresos = [], timbrado = [], tpv = [];
    if (esCliente) {
      var tipoMap = { 'Tarjeta de Crédito': 'TDC', 'Crédito Personal': 'Crédito', 'TPV': 'TPV', 'Cuenta de Cheques': 'Cheques', 'Seguros': 'Seguro', 'Nómina': 'Nómina', 'Inversión': 'Inversión' };
      var nContratos = intr_(r, 1, 3);
      for (var c = 0; c < nContratos; c++) {
        var fam = pick_(r, FAMILIAS_);
        var prods = PRODUCTOS_POR_FAMILIA_[fam] || [fam];
        var linea = intr_(r, 5, 200) * 1000;
        var saldo = Math.round(linea * r() * 0.9);
        var mora = r() < 0.25 ? pick_(r, ['1-29', '30-59', '60-89', '90+']) : 'Al corriente';
        var dias = mora === 'Al corriente' ? 0 : mora === '1-29' ? intr_(r, 1, 29) : mora === '30-59' ? intr_(r, 30, 59) : mora === '60-89' ? intr_(r, 60, 89) : intr_(r, 90, 180);
        var vence = fecha_(r, 2026, 2027);
        contratos.push({
          idContrato: 'CTR' + pad_(i, 2) + pad_(c, 2),
          producto: pick_(r, prods),
          familia: fam,
          tipo: tipoMap[fam] || fam,
          numeroCuenta: '' + intr_(r, 1000000000000000, 9999999999999999),
          saldo: saldo, saldoActual: saldo,
          linea: linea, lineaAutorizada: linea,
          saldoVencido: dias > 0 ? Math.round(saldo * (0.1 + r() * 0.3)) : 0,
          diasMora: dias,
          estatus: r() < 0.85 ? 'Activo' : (r() < 0.5 ? 'Vencido' : 'Cancelado'),
          vence: vence, fechaVencimiento: vence,
          fechaProximoPago: fecha_(r, 2026, 2026),
          bucketMora: mora,
          porVencer: r() < 0.3
        });
      }
      campanas = ['Captación PyME 2025', 'Nómina Total'].slice(0, intr_(r, 1, 2));

      // Variaciones (movimientos de cheques/créditos) — saldo corriente
      var vsaldo = intr_(r, 50, 500) * 1000;
      for (var vv = 0; vv < intr_(r, 4, 8); vv++) {
        var mov = (r() < 0.5 ? 1 : -1) * intr_(r, 1, 120) * 1000, antv = vsaldo;
        vsaldo = Math.max(0, vsaldo + mov);
        variaciones.push({ fecha: fecha_(r, 2025, 2026), tipo: pick_(r, ['Cheques', 'Crédito']), montoAnterior: antv, montoActual: vsaldo, montoMovimiento: mov });
      }
      // Ingresos no financieros (cobros por servicios)
      var conceptos = ['Comisión por manejo de cuenta', 'Comisión TPV', 'Cobro de anualidad', 'Membresía', 'Comisión por transferencia'];
      for (var gg = 0; gg < intr_(r, 2, 4); gg++) ingresos.push({ concepto: pick_(r, conceptos), monto: intr_(r, 1, 30) * 100, operaciones: intr_(r, 1, 40), fecha: fecha_(r, 2025, 2026) });
      // Timbrado / activación (derivado de contratos)
      timbrado = contratos.map(function (ct) { return { idContrato: ct.idContrato, evento: 'Activación ' + ct.producto, familia: ct.familia, criterio: 'Primera operación en 30 días', cumplido: r() < 0.7 }; });
      // TPV — afiliaciones si tiene producto TPV
      if (contratos.filter(function (ct) { return ct.familia === 'TPV'; }).length) {
        for (var tt = 0; tt < intr_(r, 1, 2); tt++) tpv.push({ numeroAfiliacion: 'AF' + intr_(r, 100000, 999999), terminalId: 'TID' + intr_(r, 1000, 9999), modelo: pick_(r, ['TPV Básico', 'TPV Plus', 'TPV Premium']), estatus: r() < 0.8 ? 'Activa' : 'Inactiva', facturacionMensual: intr_(r, 10, 400) * 1000 });
      }
    }

    // Comunicaciones y aclaraciones (cliente y prospecto)
    var canales = ['WhatsApp', 'SMS', 'Correo', 'Llamada'];
    var asuntos = ['Bienvenida', 'Recordatorio de pago', 'Oferta preaprobada', 'Aviso de vencimiento'];
    var comunicaciones = [];
    for (var k = 0; k < intr_(r, 2, 5); k++) { var asu = pick_(r, asuntos); comunicaciones.push({ canal: pick_(r, canales), asunto: asu, fecha: fecha_(r, 2025, 2026), estatus: pick_(r, ['Enviado', 'Entregado', 'Leído']), contenido: 'Mensaje de "' + asu + '" enviado al cliente como parte de la gestión comercial.' }); }
    var motivos = ['Cargo no reconocido', 'Cobro de comisión', 'Atención en sucursal', 'Tarjeta bloqueada'];
    var aclaraciones = [];
    for (var a = 0; a < intr_(r, 0, 3); a++) { var cerr = r() < 0.6; var mot = pick_(r, motivos); aclaraciones.push({ folio: 'ACL' + intr_(r, 100000, 999999), tipo: pick_(r, ['Aclaración', 'Queja', 'Comentario']), motivo: mot, estatus: cerr ? 'Cerrada' : pick_(r, ['Abierta', 'En proceso']), canal: pick_(r, canales), fecha: fecha_(r, 2025, 2026), fechaApertura: fecha_(r, 2025, 2026), fechaCierre: cerr ? fecha_(r, 2025, 2026) : '', detalle: 'El cliente reporta: ' + mot.toLowerCase() + '. Caso en seguimiento por el área correspondiente.' }); }

    var npsScore = intr_(r, 0, 10);
    clientes.push({
      comunicaciones: comunicaciones, aclaraciones: aclaraciones,
      rfc: rfc, nombre: nombre, tipoPersona: tipoPersona, segmento: pick_(r, SEGMENTOS_),
      numero: 'CLI-' + intr_(r, 4000001, 4999999),
      telefonos: '55' + intr_(r, 10000000, 99999999) + ', 81' + intr_(r, 10000000, 99999999),
      correo: nombre.toLowerCase().replace(/[^a-z]/g, '.').slice(0, 14) + '@correo.com',
      direccion: 'Av. Principal ' + intr_(r, 100, 999) + ', Monterrey, NL',
      esCliente: esCliente,
      estatus: esCliente ? (r() < 0.15 ? 'Inactivo' : 'Activo') : 'Prospecto',
      nacioComoProspecto: r() < 0.6,
      fechaAlta: fecha_(r, 2022, 2024),
      fechaConversion: esCliente ? fecha_(r, 2024, 2025) : '',
      contratos: contratos,
      campanas: campanas,
      variaciones: variaciones, ingresos: ingresos, timbrado: timbrado, tpv: tpv, denuncias: [],
      nps: { score: npsScore, categoria: npsScore <= 6 ? 'Detractor' : npsScore <= 8 ? 'Pasivo' : 'Promotor' },
      recomendacion: { producto: 'Tarjeta de Crédito Oro', familia: 'Tarjeta de Crédito', motivo: 'No cuenta con productos de Tarjeta de Crédito', score: intr_(r, 60, 95) }
    });

    // 1-2 ofertas por persona
    var nOf = intr_(r, 1, 2);
    for (var o = 0; o < nOf; o++) {
      var fam2 = pick_(r, FAMILIAS_);
      var prods2 = PRODUCTOS_POR_FAMILIA_[fam2] || [fam2];
      var etapa2 = esCliente ? pick_(r, ETAPAS_CLI_) : pick_(r, ETAPAS_PROS_);
      var subs2 = SUBETAPAS_POR_ETAPA_[etapa2] || [];
      var monto2 = intr_(r, 50, 1500) * 1000;
      ofertas.push({
        idOferta: 'OFR' + pad_(i * 10 + o + 1, 6),
        rfc: rfc,
        ejecutivo: pick_(r, EJECUTIVOS_),
        tipoOferta: esCliente ? 'Cliente' : 'Prospecto',
        tipoPersona: tipoPersona,
        familia: fam2,
        producto: pick_(r, prods2),
        etapa: etapa2,
        subEtapa: subs2.length ? pick_(r, subs2) : '',
        monto: monto2,
        fechaCierre: fecha_(r, 2026, 2026),
        // Detalle de oferta (5 subsecciones)
        fechaCreacion: fecha_(r, 2025, 2026),
        fechaVencimiento: fecha_(r, 2026, 2027),
        campana: r() < 0.6 ? pick_(r, CAMPANAS_) : '',
        folio: 'FOL' + intr_(r, 100000, 999999),
        numeroLinea: '' + intr_(r, 1, 9),
        origen: pick_(r, ORIGENES_),
        motivoDescarte: '',
        montoFijo: Math.round(monto2 * 0.6),
        montoRevolvente: Math.round(monto2 * 0.4),
        tasaInicial: intr_(r, 8, 28),
        catInicial: intr_(r, 12, 40),
        plazo: pick_(r, [12, 24, 36, 48, 60]),
        periodo: pick_(r, [1, 3, 6, 12]),
        descripcion: 'Oferta de ' + fam2 + ' generada por campaña comercial.',
        notas: []
      });
    }
  }

  return {
    familias: FAMILIAS_,
    etapasCliente: ETAPAS_CLI_.concat(['Descartado']),
    etapasProspecto: ETAPAS_PROS_.concat(['Descartado']),
    catalogos: {
      productosPorFamilia: PRODUCTOS_POR_FAMILIA_,
      subEtapasPorEtapa: SUBETAPAS_POR_ETAPA_,
      campanas: CAMPANAS_,
      origenes: ORIGENES_
    },
    clientes: clientes,
    ofertas: ofertas
  };
}

/**
 * Dataset para el CHAT DE DATOS (sql.js) — tablas ide-based equivalentes al
 * sqlDatabaseService de React (versión reducida). Devuelve filas por tabla.
 */
function getDbSeed() {
  var r = rng_(42);
  var N = 40;
  var clientes = [], tdc = [], cheques = [], tpv = [], creditos = [], seguros = [], nominas = [], variaciones = [], prospectos = [], ofertasclientes = [], ofertasprospectos = [], promotores = [];
  var tiposP = ['Persona Fisica', 'Persona Moral', 'Persona Fisica con Actividad Empresarial'];
  var bancos = ['Banco A', 'Banco B'];
  var prodTDC = ['Tarjeta Clasica', 'Tarjeta Gold', 'Tarjeta Empresarial'];
  var prodTPV = ['TPV Básico', 'TPV Plus', 'TPV Premium'];
  var prodChq = ['NominaFlex', 'NominaTradicional', 'NominaBasica'];
  var fams = ['TDC', 'TPV', 'Cheques', 'Crédito', 'Seguros', 'Nóminas'];

  for (var p = 1; p <= 6; p++) {
    promotores.push({ numeroPromotor: pad_(p, 6), nombre: NOMBRES_[p % NOMBRES_.length], banco: pick_(r, bancos), territorio: pick_(r, ['Noreste', 'Centro', 'Sureste', 'Occidente']), region: 'Monterrey, N.L.', sucursalEquipo: 'Sucursal ' + p, activo: 1 });
  }

  for (var i = 1; i <= N; i++) {
    var ide = 4000000 + i;
    var tipoPersona = pick_(r, tiposP);
    var baja = r() < 0.12 ? fecha_(r, 2025, 2026) : '';
    var rfc = 'CLI' + pad_(intr_(r, 100000, 999999), 6) + 'X' + intr_(r, 0, 9);
    clientes.push({ ide: ide, rfc: rfc, nombre: NOMBRES_[i % NOMBRES_.length] + ' ' + i, fechaAlta: fecha_(r, 2020, 2024), fechaBaja: baja, tipoPersona: tipoPersona, numeroPromotor: pad_(intr_(r, 1, 6), 6) });

    if (r() < 0.7) { var lt = intr_(r, 20, 200) * 1000, uso = Math.round(lt * r() * 0.9); tdc.push({ ide: ide, fechaBaja: r() < 0.1 ? fecha_(r, 2025, 2026) : '', producto: pick_(r, prodTDC), lineaTotal: lt, lineaDisponible: lt - uso, lineaUso: uso, fechaVencimiento: fecha_(r, 2026, 2028) }); }
    if (r() < 0.8) { cheques.push({ ide: ide, fechaBaja: '', producto: pick_(r, prodChq), saldoLinea: intr_(r, 5, 500) * 1000 }); }
    if (r() < 0.35) { tpv.push({ ide: ide, fechaBaja: '', producto: pick_(r, prodTPV), saldoFacturacion: intr_(r, 10, 400) * 1000 }); }
    if (r() < 0.4) { var mc = intr_(r, 100, 800) * 1000; creditos.push({ ide: ide, fechaBaja: '', producto: 'Crédito', montoCredito: mc, saldoActual: Math.round(mc * r()), fechaVencimiento: fecha_(r, 2026, 2029) }); }
    if (r() < 0.3) { seguros.push({ ide: ide, fechaBaja: '', producto: 'Seguro', primaAnual: intr_(r, 5, 30) * 1000, fechaVencimiento: fecha_(r, 2026, 2027) }); }
    if (r() < 0.4) { nominas.push({ ide: ide, fechaBaja: '', producto: 'Nómina', montoNomina: intr_(r, 10, 120) * 1000 }); }
    // variaciones de cheques
    if (r() < 0.8) { var saldo = intr_(r, 50, 500) * 1000; for (var v = 0; v < intr_(r, 2, 5); v++) { var mov = (r() < 0.5 ? 1 : -1) * intr_(r, 1, 200) * 1000; var ant = saldo; saldo = Math.max(0, saldo + mov); variaciones.push({ ide: ide, fechaMovimiento: fecha_(r, 2025, 2026), montoAnterior: ant, montoActual: saldo, montoMovimiento: mov }); } }
    // ofertas
    if (r() < 0.6) { var f = pick_(r, fams); ofertasclientes.push({ idOferta: 'OC' + pad_(i, 6), ide: ide, familiaProducto: f, productoInteres: f, etapa: pick_(r, ETAPAS_CLI_), montoOferta: intr_(r, 50, 1500) * 1000, fechaAlta: fecha_(r, 2025, 2026) }); }
    if (r() < 0.4) { prospectos.push({ idProspecto: 'Pr' + pad_(i, 6), rfc: rfc, tipoPersona: tipoPersona, fechaAlta: fecha_(r, 2024, 2026), fechaConversion: '', ide: ide }); var fp = pick_(r, fams); ofertasprospectos.push({ idOferta: 'OP' + pad_(i, 6), idProspecto: 'Pr' + pad_(i, 6), familiaProducto: fp, productoInteres: fp, etapa: pick_(r, ETAPAS_PROS_), montoInteres: intr_(r, 50, 800) * 1000 }); }
  }

  return { clientes: clientes, tdc: tdc, cheques: cheques, tpv: tpv, creditos: creditos, seguros: seguros, nominas: nominas, variacionescheques: variaciones, prospectos: prospectos, ofertasclientes: ofertasclientes, ofertasprospectos: ofertasprospectos, promotores: promotores };
}
