import { API_BASE_URL, isDirectServiceUrl } from '../config'

export type HealthResponse = {
  status: string
  [key: string]: unknown
}

export const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
export const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

const UNSAFE_HTTP_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const FORBIDDEN_TOKEN_KEYS = [
  'access_token',
  'refresh_token',
  'id_token',
  'accessToken',
  'refreshToken',
  'idToken',
  'jwt',
  'kc_token',
] as const

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message?: string) {
    super(message ?? `Backend request failed: ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

let inMemoryCsrfToken: string | null = null

export function setCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token?.trim() || null
}

export function readCookieValue(
  cookieName: string,
  cookieSource?: string,
): string | null {
  const rawCookies =
    cookieSource ?? (typeof document !== 'undefined' ? document.cookie : '')

  if (!rawCookies) {
    return null
  }

  const segments = rawCookies.split(';')
  for (const segment of segments) {
    const [rawKey, ...rawValParts] = segment.trim().split('=')
    if (rawKey === cookieName) {
      const value = rawValParts.join('=')
      return value ? decodeURIComponent(value) : null
    }
  }

  return null
}

export function getCsrfToken(cookieSource?: string): string | null {
  return readCookieValue(CSRF_COOKIE_NAME, cookieSource) ?? inMemoryCsrfToken
}

export function purgeBrowserStoredTokens(): void {
  if (typeof window === 'undefined') {
    return
  }

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of FORBIDDEN_TOKEN_KEYS) {
        storage.removeItem(key)
      }
    } catch {
      // Ignora ambientes sem acesso a Web Storage
    }
  }
}

export function isUnsafeMethod(method?: string): boolean {
  return UNSAFE_HTTP_METHODS.has((method ?? 'GET').toUpperCase())
}

export function buildGatewayHeaders(
  init?: RequestInit,
  cookieSource?: string,
): Headers {
  const headers = new Headers(init?.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  // O portal nunca envia Bearer token do navegador; a sessão é mantida em cookie httpOnly no BFF
  headers.delete('Authorization')

  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (isUnsafeMethod(init?.method)) {
    const csrfToken = getCsrfToken(cookieSource)
    if (csrfToken && !headers.has(CSRF_HEADER_NAME)) {
      headers.set(CSRF_HEADER_NAME, csrfToken)
    }
  }

  return headers
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (isDirectServiceUrl(API_BASE_URL)) {
    throw new Error(
      'VITE_API_BASE_URL deve apontar para o API Gateway, não diretamente para microsserviços.',
    )
  }

  purgeBrowserStoredTokens()

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...init,
    credentials: 'include',
    headers: buildGatewayHeaders(init),
  })

  const responseCsrf = response.headers.get(CSRF_HEADER_NAME)
  if (responseCsrf) {
    setCsrfToken(responseCsrf)
  }

  if (!response.ok) {
    throw new ApiError(response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function fetchBackendHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health')
}
