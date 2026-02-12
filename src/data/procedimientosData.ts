/**
 * Datos de procedimientos bancarios para el modo "Consulta Procedimientos"
 * Contiene procedimientos detallados que el agente de IA usará para guiar al ejecutivo
 */

export interface PasoProcedimiento {
  numero: number
  titulo: string
  descripcion: string
  detalles: string[]
  documentos?: string[]
  excepcion?: string
}

export interface Procedimiento {
  id: string
  nombre: string
  categoria: string
  descripcion: string
  pasos: PasoProcedimiento[]
  excepciones: { titulo: string; descripcion: string; accion: string }[]
  documentosRequeridos: string[]
  tiempoEstimado: string
  notas: string[]
}

// ============================================================
// PROCEDIMIENTO: Contratación de Tarjeta de Crédito (TDC)
// ============================================================

const procedimientoTDC: Procedimiento = {
  id: 'PROC-TDC-001',
  nombre: 'Contratación de Tarjeta de Crédito (TDC)',
  categoria: 'Crédito',
  descripcion:
    'Proceso completo para la contratación de una Tarjeta de Crédito, desde la identificación del cliente hasta la entrega del plástico. Incluye validación paramétrica, excepciones de riesgo y condiciones especiales.',
  tiempoEstimado: '3-7 días hábiles',
  documentosRequeridos: [
    'Identificación oficial vigente (INE/IFE o Pasaporte)',
    'Comprobante de domicilio no mayor a 3 meses (CFE, agua, teléfono)',
    'Comprobante de ingresos (últimos 3 recibos de nómina o estados de cuenta)',
    'RFC con homoclave',
    'CURP',
    'Solicitud de crédito firmada',
    'Autorización de consulta a Buró de Crédito',
    'Carátula de estado de cuenta bancario (para domiciliación)',
  ],
  pasos: [
    {
      numero: 1,
      titulo: 'Identificación y Perfilamiento del Cliente',
      descripcion:
        'Identificar al cliente y verificar su elegibilidad inicial para TDC.',
      detalles: [
        'Verificar que el cliente tenga al menos 18 años y máximo 69 años',
        'Consultar en el sistema CRM si es cliente existente o nuevo',
        'Si es cliente existente: revisar historial de productos, antigüedad y comportamiento de pago',
        'Si es cliente nuevo: verificar que no tenga solicitudes previas rechazadas en los últimos 6 meses',
        'Consultar Score interno del cliente (si aplica) - mínimo 600 puntos',
        'Validar que el ingreso mensual bruto sea mínimo $8,000 MXN',
        'Identificar el segmento del cliente: Masivo, Preferente o Premium',
      ],
      excepcion:
        'Si el cliente tiene menos de 6 meses de antigüedad laboral, se requiere carta del empleador confirmando puesto y salario.',
    },
    {
      numero: 2,
      titulo: 'Solicitud de Documentos',
      descripcion:
        'Recopilar toda la documentación necesaria para el trámite.',
      detalles: [
        'Entregar al cliente la lista de documentos requeridos',
        'Verificar que la identificación oficial esté vigente y legible',
        'El comprobante de domicilio debe coincidir con la dirección declarada',
        'Los comprobantes de ingresos deben ser de los últimos 3 meses consecutivos',
        'Para trabajadores independientes: últimas 2 declaraciones anuales de impuestos + 6 meses de estados de cuenta',
        'Digitalizar todos los documentos en formato PDF con resolución mínima de 300 DPI',
        'Verificar que la firma en los documentos coincida con la identificación oficial',
      ],
      documentos: [
        'INE/IFE vigente (ambos lados)',
        'Comprobante de domicilio',
        'Últimos 3 recibos de nómina',
        'RFC',
        'CURP',
      ],
      excepcion:
        'Si el cliente es extranjero, se acepta pasaporte vigente + FM2/FM3 o tarjeta de residente permanente.',
    },
    {
      numero: 3,
      titulo: 'Alta en Fábrica de Créditos',
      descripcion:
        'Registrar la solicitud en el sistema de Fábrica de Créditos para evaluación.',
      detalles: [
        'Ingresar al sistema de Fábrica de Créditos con credenciales de ejecutivo',
        'Seleccionar "Nueva Solicitud" → "Tarjeta de Crédito"',
        'Capturar datos personales del cliente: nombre completo, fecha de nacimiento, estado civil, dependientes económicos',
        'Capturar datos laborales: empresa, puesto, antigüedad, ingreso mensual bruto y neto',
        'Capturar datos de contacto: teléfono fijo, celular, email',
        'Adjuntar documentos digitalizados en la sección correspondiente',
        'Seleccionar el tipo de TDC según perfil del cliente (Clásica, Oro, Platinum)',
        'El sistema asignará un número de solicitud (folio) - guardar este número',
        'Confirmar que el estatus de la solicitud sea "En Evaluación"',
      ],
      excepcion:
        'Si el sistema muestra "Cliente con alertas PLD/FT", detener el proceso y notificar inmediatamente al área de Cumplimiento.',
    },
    {
      numero: 4,
      titulo: 'Evaluación del Modelo Paramétrico',
      descripcion:
        'El modelo paramétrico evalúa automáticamente la solicitud basándose en reglas de riesgo.',
      detalles: [
        'El modelo paramétrico evalúa los siguientes criterios automáticamente:',
        '  - Score de Buró de Crédito (peso 35%): mínimo 580 puntos',
        '  - Capacidad de pago (peso 25%): pago mensual no debe exceder 30% del ingreso neto',
        '  - Antigüedad laboral (peso 15%): mínimo 1 año en empleo actual',
        '  - Historial con la institución (peso 15%): comportamiento de otros productos',
        '  - Perfil demográfico (peso 10%): edad, estado civil, zona geográfica',
        'Tiempo de respuesta estimado: 15-30 minutos para clientes existentes, hasta 2 horas para nuevos',
        'Resultado posible: APROBADO, RECHAZADO, o EN REVISIÓN MANUAL',
        'Si es APROBADO: el sistema genera la línea de crédito autorizada y tipo de tarjeta',
        'Si es RECHAZADO: verificar motivo en el detalle de la evaluación',
        'Si es EN REVISIÓN MANUAL: la solicitud pasa a un analista de riesgos senior',
      ],
      excepcion:
        'Si el score de buró es entre 550-579, el modelo lo marca como "zona gris" y requiere revisión manual obligatoria.',
    },
    {
      numero: 5,
      titulo: 'Gestión de Rechazo - Escalamiento a Riesgos',
      descripcion:
        'En caso de rechazo por el modelo paramétrico, el ejecutivo puede escalar al área de Riesgos para solicitar aprobación con condiciones especiales.',
      detalles: [
        'Verificar el motivo específico del rechazo en el sistema',
        'Si el rechazo es por score bajo pero el cliente tiene buen historial interno → se puede escalar',
        'Si el rechazo es por capacidad de pago insuficiente → puede escalarse con garantía adicional',
        'NO se puede escalar si: el cliente está en listas negras PLD, tiene créditos en litigio, o tiene score < 500',
        'Para escalar: enviar correo al área de Riesgos (riesgos.credito@banco.com) con:',
        '  - Folio de solicitud',
        '  - Justificación comercial (relación con el cliente, productos vigentes, potencial)',
        '  - Propuesta de mitigación (línea reducida, depósito en garantía, etc.)',
        'El área de Riesgos tiene 48 horas hábiles para responder',
        'Posibles respuestas de Riesgos:',
        '  - Aprobación con tasa condicionada (tasa base + 5-15 puntos porcentuales)',
        '  - Aprobación con línea reducida (50-70% de lo solicitado)',
        '  - Aprobación con depósito en garantía (10-30% de la línea)',
        '  - Rechazo definitivo (sin posibilidad de re-solicitud por 6 meses)',
      ],
      excepcion:
        'Para clientes con más de 5 años de antigüedad y sin atrasos, el Director de Sucursal puede aprobar directamente líneas hasta $50,000 MXN sin pasar por Riesgos.',
    },
    {
      numero: 6,
      titulo: 'Condiciones de Aprobación con Tasa Condicionada',
      descripcion:
        'Cuando Riesgos aprueba con condiciones especiales, el ejecutivo debe informar y obtener aceptación del cliente.',
      detalles: [
        'Tasa condicionada: se aplica un sobreprecio sobre la tasa base según nivel de riesgo:',
        '  - Riesgo Bajo-Medio: tasa base + 5 pp (ej: si tasa base es 28%, se aplica 33%)',
        '  - Riesgo Medio: tasa base + 10 pp (ej: 28% → 38%)',
        '  - Riesgo Alto: tasa base + 15 pp (ej: 28% → 43%)',
        'La tasa condicionada se puede revisar a los 12 meses si el cliente mantiene buen comportamiento',
        'Criterios para revisión de tasa: 0 atrasos, uso promedio < 70% de la línea, al menos 6 MSI realizados',
        'Si el cliente acepta las condiciones, firmar el adéndum de condiciones especiales',
        'Registrar en el sistema la aprobación condicional con el número de autorización de Riesgos',
        'El cliente tiene 5 días hábiles para aceptar o rechazar las condiciones',
      ],
      excepcion:
        'Si el cliente tiene un producto de inversión vigente con saldo > $100,000, se puede solicitar tasa preferencial a pesar de la condición de riesgo.',
    },
    {
      numero: 7,
      titulo: 'Formalización y Firma de Contrato',
      descripcion:
        'Una vez aprobada la solicitud, se procede a la firma del contrato.',
      detalles: [
        'Generar el contrato en el sistema con los datos aprobados',
        'Imprimir contrato en 2 tantos (cliente y banco)',
        'Revisar con el cliente: línea de crédito, tasa de interés, CAT, fecha de corte, fecha de pago',
        'Explicar comisiones: anualidad, disposición de efectivo, pago tardío',
        'Obtener firma autógrafa del cliente en todas las hojas del contrato',
        'Firma del ejecutivo como testigo',
        'Entregar copia del contrato al cliente junto con carátula informativa',
        'Registrar en el sistema que el contrato fue firmado exitosamente',
      ],
    },
    {
      numero: 8,
      titulo: 'Entrega de Tarjeta y Activación',
      descripcion:
        'Entrega del plástico al cliente y activación en el sistema.',
      detalles: [
        'La tarjeta se genera en 3-5 días hábiles después de la firma',
        'El cliente recibe notificación por SMS cuando la tarjeta está lista',
        'Verificar identidad del cliente al momento de la entrega',
        'Entregar la tarjeta en sobre sellado junto con el NIP temporal',
        'Realizar la activación en el sistema ingresando el número de tarjeta',
        'Solicitar al cliente que cambie el NIP en el cajero automático más cercano',
        'Ofrecer la activación de banca en línea y app móvil',
        'Informar sobre el programa de recompensas (si aplica)',
        'Registrar la entrega exitosa en el sistema CRM',
      ],
    },
  ],
  excepciones: [
    {
      titulo: 'Cliente menor de 21 años',
      descripcion:
        'Los clientes entre 18 y 20 años requieren un aval o cotitular mayor de 25 años con historial crediticio comprobable.',
      accion:
        'Solicitar los documentos del aval/cotitular adicionales y registrarlo en la solicitud como obligado solidario.',
    },
    {
      titulo: 'Dirección de domicilio en zona rural o de difícil acceso',
      descripcion:
        'Si el comprobante de domicilio corresponde a una zona rural catalogada como "zona de riesgo geográfico".',
      accion:
        'Se requiere verificación domiciliaria presencial por parte del área de Investigación. Tiempo adicional: 5 días hábiles.',
    },
    {
      titulo: 'Ingreso variable (comisionista, freelancer)',
      descripcion:
        'El cliente no tiene ingreso fijo comprobable con recibos de nómina.',
      accion:
        'Solicitar últimos 6 estados de cuenta bancarios + 2 declaraciones anuales de impuestos. El ingreso se calcula como promedio de los últimos 6 meses con un factor de ajuste del 70%.',
    },
    {
      titulo: 'Cliente con reestructura de crédito previa',
      descripcion:
        'El cliente tuvo una reestructura de algún crédito en los últimos 24 meses.',
      accion:
        'Se requiere carta de no adeudo del crédito reestructurado + aprobación del Comité de Crédito (sesión semanal, martes y jueves). Línea máxima autorizable: $30,000 MXN.',
    },
    {
      titulo: 'Persona Políticamente Expuesta (PEP)',
      descripcion:
        'El cliente o un familiar directo ocupa o ha ocupado un cargo público relevante.',
      accion:
        'Notificar al área de Cumplimiento/PLD antes de continuar. Se requiere aprobación especial del Oficial de Cumplimiento. Documentación adicional: declaración patrimonial y constancia de función pública.',
    },
    {
      titulo: 'Error en Buró de Crédito',
      descripcion:
        'El cliente alega que su reporte de Buró contiene información incorrecta que afecta su score.',
      accion:
        'El cliente debe presentar su Reporte de Crédito Especial mostrando la reclamación ante Buró. Si la reclamación está en proceso, se puede poner la solicitud en "espera" por hasta 30 días. Si se resuelve favorablemente, reenviar al modelo paramétrico.',
    },
  ],
  notas: [
    'El ejecutivo debe registrar todas las interacciones con el cliente en el CRM',
    'Las solicitudes incompletas se cancelan automáticamente después de 30 días naturales',
    'Para líneas superiores a $150,000 MXN se requiere aprobación del Comité de Crédito',
    'Clientes del segmento Premium (ingreso > $85,000/mes) pueden acceder a tarjetas exclusivas con preaprobación automática',
    'El ejecutivo debe informar al cliente sobre su derecho a desistir del contrato dentro de los 10 días hábiles siguientes a la firma sin penalización',
    'Toda la información del cliente es confidencial y está protegida por la LFPDPPP',
  ],
}

// ============================================================
// Exportaciones
// ============================================================

/** Todos los procedimientos disponibles */
export const procedimientos: Procedimiento[] = [procedimientoTDC]

/** Genera el texto completo de todos los procedimientos para enviarlo al agente */
export function generarTextoProcedimientos(): string {
  return procedimientos
    .map((proc) => {
      const pasos = proc.pasos
        .map(
          (p) =>
            `### Paso ${p.numero}: ${p.titulo}\n${p.descripcion}\n${p.detalles.map((d) => `- ${d}`).join('\n')}${
              p.documentos
                ? `\n**Documentos del paso:** ${p.documentos.join(', ')}`
                : ''
            }${p.excepcion ? `\n**⚠️ Excepción:** ${p.excepcion}` : ''}`
        )
        .join('\n\n')

      const excepciones = proc.excepciones
        .map(
          (e) =>
            `- **${e.titulo}:** ${e.descripcion}\n  → Acción: ${e.accion}`
        )
        .join('\n')

      const docs = proc.documentosRequeridos
        .map((d) => `- ${d}`)
        .join('\n')

      return `# ${proc.nombre}
**Categoría:** ${proc.categoria}
**Tiempo estimado:** ${proc.tiempoEstimado}
**ID:** ${proc.id}

${proc.descripcion}

## Documentos Requeridos
${docs}

## Pasos del Procedimiento

${pasos}

## Excepciones y Casos Especiales
${excepciones}

## Notas Importantes
${proc.notas.map((n) => `- ${n}`).join('\n')}`
    })
    .join('\n\n---\n\n')
}
