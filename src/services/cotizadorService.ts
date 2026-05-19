/**
 * Servicio del Cotizador de Créditos
 * Integración con n8n para cotización de préstamos
 */

// Webhook del cotizador en n8n
const WEBHOOK_COTIZADOR = 'https://fjrv1818.app.n8n.cloud/webhook/cotizador-IA'

// Tipos de crédito disponibles
export type TipoCredito = 'hipotecario' | 'personal' | 'auto'

// Configuración de productos
export const PRODUCTOS_CREDITO = {
  hipotecario: {
    nombre: 'Crédito Hipotecario',
    montoMinimo: 1000000,
    montoMaximo: 50000000,
    plazosAnios: [10, 15, 20, 25, 30],
    tasas: {
      10: 9.5,
      15: 10.0,
      20: 10.5,
      25: 11.0,
      30: 12.0,
    },
  },
  personal: {
    nombre: 'Crédito Personal',
    montoMinimo: 50000,
    montoMaximo: 500000,
    plazosMeses: [12, 18, 24],
    tasas: {
      12: 18,
      18: 22,
      24: 28,
    },
  },
  auto: {
    nombre: 'Crédito de Auto',
    montoMinimo: 200000,
    montoMaximo: 2000000,
    plazosMeses: [12, 24, 36, 48, 60],
    tasas: {
      12: 12,
      24: 13,
      36: 14,
      48: 16,
      60: 18,
    },
  },
} as const

// Interfaces
export interface SolicitudCotizacion {
  tipoCredito: TipoCredito
  monto: number
  plazo: number // En meses
  enganche?: number
}

export interface AmortizacionFila {
  mes: number
  pagoMensual: number
  capital: number
  interes: number
  saldo: number
}

export interface ResultadoCotizacion {
  producto: string
  montoSolicitado: number
  enganche: number
  montoFinanciar: number
  tasaAnual: number
  plazoMeses: number
  pagoMensual: number
  totalAPagar: number
  interesesTotales: number
  tablaAmortizacion: AmortizacionFila[]
  mensaje?: string
  error?: string
}

/**
 * Calcula la cotización de crédito localmente
 * (Fallback si n8n no está disponible)
 */
export function calcularCotizacion(solicitud: SolicitudCotizacion): ResultadoCotizacion {
  const { tipoCredito, monto, plazo, enganche = 0 } = solicitud
  const config = PRODUCTOS_CREDITO[tipoCredito]
  
  // Validaciones
  if (monto < config.montoMinimo) {
    return {
      producto: config.nombre,
      montoSolicitado: monto,
      enganche: 0,
      montoFinanciar: 0,
      tasaAnual: 0,
      plazoMeses: 0,
      pagoMensual: 0,
      totalAPagar: 0,
      interesesTotales: 0,
      tablaAmortizacion: [],
      error: `El monto mínimo para ${config.nombre} es $${config.montoMinimo.toLocaleString('es-MX')}`,
    }
  }
  
  // Obtener tasa según plazo
  let tasaAnual: number
  if (tipoCredito === 'hipotecario') {
    const plazoAnios = Math.round(plazo / 12)
    const tasas = config.tasas as Record<number, number>
    tasaAnual = tasas[plazoAnios] || 12
  } else {
    const tasas = config.tasas as Record<number, number>
    const valoresTasas = Object.values(tasas)
    tasaAnual = tasas[plazo] || valoresTasas[valoresTasas.length - 1] || 12
  }
  
  // Calcular monto a financiar
  const montoFinanciar = monto - enganche
  
  // Tasa mensual
  const tasaMensual = tasaAnual / 100 / 12
  
  // Fórmula del pago mensual (sistema francés)
  // M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const factor = Math.pow(1 + tasaMensual, plazo)
  const pagoMensual = montoFinanciar * (tasaMensual * factor) / (factor - 1)
  
  // Total a pagar
  const totalAPagar = pagoMensual * plazo
  const interesesTotales = totalAPagar - montoFinanciar
  
  // Generar tabla de amortización (primeros 12 meses + últimos 3)
  const tablaAmortizacion: AmortizacionFila[] = []
  let saldo = montoFinanciar
  
  for (let mes = 1; mes <= plazo; mes++) {
    const interesMes = saldo * tasaMensual
    const capitalMes = pagoMensual - interesMes
    saldo = saldo - capitalMes
    
    tablaAmortizacion.push({
      mes,
      pagoMensual: Math.round(pagoMensual * 100) / 100,
      capital: Math.round(capitalMes * 100) / 100,
      interes: Math.round(interesMes * 100) / 100,
      saldo: Math.max(0, Math.round(saldo * 100) / 100),
    })
  }
  
  return {
    producto: config.nombre,
    montoSolicitado: monto,
    enganche,
    montoFinanciar,
    tasaAnual,
    plazoMeses: plazo,
    pagoMensual: Math.round(pagoMensual * 100) / 100,
    totalAPagar: Math.round(totalAPagar * 100) / 100,
    interesesTotales: Math.round(interesesTotales * 100) / 100,
    tablaAmortizacion,
    mensaje: `¡Excelente! Tu cotización de ${config.nombre} está lista.`,
  }
}

/**
 * Envía solicitud al agente cotizador en n8n
 */
export async function enviarACotizador(
  mensaje: string,
  sessionId: string
): Promise<{ respuesta: string; cotizacion?: ResultadoCotizacion }> {
  try {
    const response = await fetch(WEBHOOK_COTIZADOR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensaje,
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extraer respuesta del formato de n8n
    let textoRespuesta = ''
    if (data.output) {
      textoRespuesta = data.output
    } else if (data.text) {
      textoRespuesta = data.text
    } else if (data.response) {
      textoRespuesta = data.response
    } else if (Array.isArray(data) && data[0]) {
      textoRespuesta = data[0].output || data[0].text || JSON.stringify(data[0])
    } else {
      textoRespuesta = JSON.stringify(data)
    }
    
    // Intentar parsear como JSON de cotización
    try {
      let jsonStr = textoRespuesta.trim()
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7)
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3)
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3)
      jsonStr = jsonStr.trim()
      
      const parsed = JSON.parse(jsonStr)
      
      // Si tiene datos de cotización, calcular localmente
      if (parsed.tipoCredito && parsed.monto && parsed.plazo) {
        const cotizacion = calcularCotizacion({
          tipoCredito: parsed.tipoCredito,
          monto: parsed.monto,
          plazo: parsed.plazo,
          enganche: parsed.enganche || 0,
        })
        return {
          respuesta: cotizacion.mensaje || 'Cotización generada',
          cotizacion,
        }
      }
      
      return { respuesta: parsed.mensaje || textoRespuesta }
    } catch {
      return { respuesta: textoRespuesta }
    }
  } catch (error) {
    console.error('Error llamando al cotizador:', error)
    return {
      respuesta: 'Hubo un problema al cotizar. Por favor intenta de nuevo.',
    }
  }
}

/**
 * Sugerencias rápidas para el cotizador
 */
export const SUGERENCIAS_COTIZADOR = [
  { texto: 'Cotizar Hipoteca', valor: 'Quiero cotizar un crédito hipotecario' },
  { texto: 'Cotizar Auto', valor: 'Quiero cotizar un crédito de auto' },
  { texto: 'Préstamo Personal', valor: 'Quiero cotizar un préstamo personal' },
]
