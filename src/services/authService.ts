import { GATEWAY_ORIGIN } from '../config'
import {
  apiRequest,
  getCsrfToken,
  purgeBrowserStoredTokens,
  setCsrfToken,
} from './api'

export const PORTAL_ROLES = ['FAMILIAR', 'MEDICO', 'OPERADORA', 'EQUIPE'] as const

export type PortalRole = (typeof PORTAL_ROLES)[number]

export type BffUserProfile = {
  sub: string
  name: string
  email: string
  roles: PortalRole[]
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

export function unauthenticatedSession(): BffSessionResponse {
  return {
    authenticated: false,
    sessionKeyPrefix: 'gw:sess',
    csrfHeaderName: 'X-XSRF-TOKEN',
    csrfProtected: false,
    user: null,
  }
}

export const UNAUTHENTICATED_SESSION: BffSessionResponse = unauthenticatedSession()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** Mantém só papéis conhecidos. Papel ausente ou desconhecido não concede acesso. */
function parseRoles(value: unknown): PortalRole[] {
  if (!Array.isArray(value)) {
    return []
  }

  const roles = new Set<PortalRole>()
  for (const raw of value) {
    if (typeof raw !== 'string') {
      continue
    }
    const upper = raw.trim().toUpperCase()
    if ((PORTAL_ROLES as readonly string[]).includes(upper)) {
      roles.add(upper as PortalRole)
    }
  }
  return [...roles]
}

/**
 * Valida a resposta do BFF. Qualquer formato inesperado resulta em sessão não autenticada.
 */
export function parseBffSession(payload: unknown): BffSessionResponse {
  if (!isRecord(payload) || payload.authenticated !== true || !isRecord(payload.user)) {
    return unauthenticatedSession()
  }

  const { sub, name, email, roles } = payload.user
  if (!isNonEmptyString(sub)) {
    return unauthenticatedSession()
  }

  return {
    authenticated: true,
    sessionKeyPrefix: 'gw:sess',
    csrfHeaderName: 'X-XSRF-TOKEN',
    csrfProtected: Boolean(getCsrfToken()),
    user: {
      sub,
      name: isNonEmptyString(name) ? name.trim() : '',
      email: isNonEmptyString(email) ? email.trim() : '',
      roles: parseRoles(roles),
    },
    expiresAt: typeof payload.expiresAt === 'string' ? payload.expiresAt : undefined,
  }
}

/**
 * Consulta a sessão no BFF e falha fechado: erro de rede, 401, 403, 5xx ou resposta
 * inválida resultam em sessão não autenticada.
 */
export async function fetchBffSession(): Promise<BffSessionResponse> {
  purgeBrowserStoredTokens()

  // Demonstração só no servidor de desenvolvimento e com VITE_MODO_DEMO=true.
  // A condição fica literal aqui para o build de produção descartar o módulo.
  if (import.meta.env.DEV && import.meta.env.VITE_MODO_DEMO === 'true') {
    const { createDemoSession } = await import('./demoSession')
    return createDemoSession()
  }

  try {
    const payload = await apiRequest<unknown>('/auth/session')
    if (isRecord(payload) && isNonEmptyString(payload.csrfToken)) {
      setCsrfToken(payload.csrfToken)
    }
    return parseBffSession(payload)
  } catch {
    setCsrfToken(null)
    return unauthenticatedSession()
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
    // Sem token novo: as escritas continuam com o token atual ou são recusadas pelo gateway
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
