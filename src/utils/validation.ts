/**
 * Utilidades de validación
 */

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida que no esté vacío
 */
export function isNotEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * Valida formato de teléfono (básico)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s()-]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Valida URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Valida rango numérico
 */
export function isInRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max
}

/**
 * Tipos de validación para campos
 */
export type ValidationRule = {
  type: 'required' | 'email' | 'phone' | 'url' | 'min' | 'max' | 'pattern'
  value?: number | string | RegExp
  message: string
}

/**
 * Valida un campo según sus reglas
 */
export function validateField(
  value: unknown,
  rules: ValidationRule[]
): string | null {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!isNotEmpty(value)) return rule.message
        break
      case 'email':
        if (typeof value === 'string' && !isValidEmail(value)) return rule.message
        break
      case 'phone':
        if (typeof value === 'string' && !isValidPhone(value)) return rule.message
        break
      case 'url':
        if (typeof value === 'string' && !isValidUrl(value)) return rule.message
        break
      case 'min':
        if (typeof value === 'number' && value < (rule.value as number)) return rule.message
        break
      case 'max':
        if (typeof value === 'number' && value > (rule.value as number)) return rule.message
        break
      case 'pattern':
        if (typeof value === 'string' && !(rule.value as RegExp).test(value)) return rule.message
        break
    }
  }
  return null
}

