/**
 * Servicio base para comunicación HTTP
 * Wrapper sobre fetch con manejo de errores y reintentos
 */

import { API_CONFIG } from '@/config'
import type { ApiResponse, ApiError } from '@/types'

/** Opciones para las peticiones */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

/**
 * Realiza una petición HTTP con manejo de errores
 */
async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_CONFIG.timeout,
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...API_CONFIG.defaultHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: data.message || response.statusText,
          details: data,
        },
      }
    }

    return {
      success: true,
      data,
      metadata: {
        requestId: response.headers.get('x-request-id') || crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    clearTimeout(timeoutId)

    const apiError: ApiError = {
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Error de red desconocido',
    }

    if (error instanceof Error && error.name === 'AbortError') {
      apiError.code = 'TIMEOUT'
      apiError.message = 'La petición excedió el tiempo límite'
    }

    return {
      success: false,
      error: apiError,
    }
  }
}

/**
 * Servicio de API con métodos HTTP
 */
export const apiService = {
  get: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: 'GET', headers }),

  post: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(url, { method: 'POST', body, headers }),

  put: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(url, { method: 'PUT', body, headers }),

  patch: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(url, { method: 'PATCH', body, headers }),

  delete: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: 'DELETE', headers }),
}


