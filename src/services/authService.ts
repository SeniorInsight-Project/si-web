import { GATEWAY_ORIGIN } from '../config'
import {
  apiRequest,
  ApiError,
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
  /** O gateway não respondeu (rede, 5xx ou resposta inválida). A sessão continua fechada. */
  unavailable?: boolean
  expiresAt?: string
  csrfToken?: string
}

/** Início do login OIDC no BFF. Depois do Keycloak, o gateway sempre leva a /portal. */
export function buildOidcLoginUrl(): string {
  return `${GATEWAY_ORIGIN}/oauth2/authorization/keycloak`
}

/** Logout no BFF: POST com o token de CSRF, que encerra também a sessão do Keycloak. */
export function buildOidcLogoutUrl(): string {
  return `${GATEWAY_ORIGIN}/logout`
}

export function unauthenticatedSession(unavailable = false): BffSessionResponse {
  return {
    authenticated: false,
    sessionKeyPrefix: 'gw:sess',
    csrfHeaderName: 'X-XSRF-TOKEN',
    csrfProtected: false,
    user: null,
    ...(unavailable ? { unavailable: true } : {}),
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
 * inválida resultam em sessão não autenticada. Fora o 401/403, a sessão volta marcada
 * como `unavailable`, para o portal oferecer uma nova tentativa.
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
    if (!isRecord(payload) || typeof payload.authenticated !== 'boolean') {
      return unauthenticatedSession(true)
    }
    return parseBffSession(payload)
  } catch (error) {
    setCsrfToken(null)
    const negado = error instanceof ApiError && (error.status === 401 || error.status === 403)
    return unauthenticatedSession(!negado)
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

/**
 * Sai pelo BFF: envia um formulário POST /logout com o token de CSRF. A navegação passa
 * pelo logout do Keycloak e volta à página inicial. Sem token (gateway fora do ar), só
 * limpa o estado local e devolve false.
 */
export async function logoutBffSession(): Promise<boolean> {
  purgeBrowserStoredTokens()
  const token = await refreshBffCsrfToken()
  setCsrfToken(null)

  if (!token || typeof document === 'undefined') {
    return false
  }

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = buildOidcLogoutUrl()
  form.style.display = 'none'
  const campo = document.createElement('input')
  campo.type = 'hidden'
  campo.name = '_csrf'
  campo.value = token
  form.appendChild(campo)
  document.body.appendChild(form)
  form.submit()
  return true
}
