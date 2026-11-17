import { GATEWAY_ORIGIN } from '../config'
import {
  apiRequest,
  ApiError,
  getCsrfToken,
  purgeBrowserStoredTokens,
  setCsrfToken,
} from './api'

export type PortalRole = 'FAMILIAR' | 'MEDICO' | 'OPERADORA' | 'EQUIPE'

export type BffUserProfile = {
  sub: string
  name: string
  email: string
  roles: PortalRole[]
  activeRole: PortalRole
}

export type BffSessionResponse = {
  authenticated: boolean
  sessionKeyPrefix: 'gw:sess'
  csrfHeaderName: 'X-XSRF-TOKEN'
  csrfProtected: boolean
  user: BffUserProfile | null
  expiresAt?: string
  csrfToken?: string
}

export function buildOidcLoginUrl(returnTo = '/portal'): string {
  const safePath = returnTo.startsWith('/') ? returnTo : '/portal'
  const redirectParam = encodeURIComponent(safePath)
  return `${GATEWAY_ORIGIN}/oauth2/authorization/keycloak?redirect_uri=${redirectParam}`
}

export function buildOidcLogoutUrl(): string {
  return `${GATEWAY_ORIGIN}/logout`
}

export const UNAUTHENTICATED_SESSION: BffSessionResponse = {
  authenticated: false,
  sessionKeyPrefix: 'gw:sess',
  csrfHeaderName: 'X-XSRF-TOKEN',
  csrfProtected: Boolean(getCsrfToken()),
  user: null,
}

export async function fetchBffSession(): Promise<BffSessionResponse> {
  purgeBrowserStoredTokens()

  try {
    const session = await apiRequest<BffSessionResponse>('/auth/session')
    if (session.csrfToken) {
      setCsrfToken(session.csrfToken)
    }

    return {
      ...session,
      sessionKeyPrefix: 'gw:sess',
      csrfHeaderName: 'X-XSRF-TOKEN',
      csrfProtected: Boolean(getCsrfToken() || session.csrfProtected),
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return UNAUTHENTICATED_SESSION
    }

    throw error
  }
}

export async function refreshBffCsrfToken(): Promise<string | null> {
  try {
    const payload = await apiRequest<{ token?: string; headerName?: string }>('/auth/csrf')
    if (payload?.token) {
      setCsrfToken(payload.token)
      return payload.token
    }
  } catch {
    // Caso o gateway esteja offline, mantém o token atual se existir
  }

  return getCsrfToken()
}

export async function logoutBffSession(): Promise<void> {
  purgeBrowserStoredTokens()

  try {
    await apiRequest<void>('/auth/logout', {
      method: 'POST',
    })
  } finally {
    setCsrfToken(null)
  }
}
