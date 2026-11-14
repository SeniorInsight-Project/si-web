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

export function createDemoSession(role: PortalRole = 'FAMILIAR'): BffSessionResponse {
  const profilesByRole: Record<PortalRole, BffUserProfile> = {
    FAMILIAR: {
      sub: 'kc-sub-familiar-01',
      name: 'Carlos Eduardo Lima',
      email: 'carlos.lima@familia.seniorinsight.com.br',
      roles: ['FAMILIAR', 'MEDICO', 'OPERADORA', 'EQUIPE'],
      activeRole: 'FAMILIAR',
    },
    MEDICO: {
      sub: 'kc-sub-medico-01',
      name: 'Dr. Henrique Silva',
      email: 'henrique.silva@clinica.seniorinsight.com.br',
      roles: ['FAMILIAR', 'MEDICO', 'OPERADORA', 'EQUIPE'],
      activeRole: 'MEDICO',
    },
    OPERADORA: {
      sub: 'kc-sub-operadora-01',
      name: ' Marina Costa (ViverBem)',
      email: 'marina.costa@viverbem.com.br',
      roles: ['FAMILIAR', 'MEDICO', 'OPERADORA', 'EQUIPE'],
      activeRole: 'OPERADORA',
    },
    EQUIPE: {
      sub: 'kc-sub-equipe-01',
      name: 'Engenharia & DPO SeniorInsight',
      email: 'governanca@seniorinsight.com.br',
      roles: ['FAMILIAR', 'MEDICO', 'OPERADORA', 'EQUIPE'],
      activeRole: 'EQUIPE',
    },
  }

  return {
    authenticated: true,
    sessionKeyPrefix: 'gw:sess',
    csrfHeaderName: 'X-XSRF-TOKEN',
    csrfProtected: true,
    user: {
      ...profilesByRole[role],
      name: profilesByRole[role].name.trim(),
    },
  }
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

    // Fallback de demonstração local quando o container do api-gateway não está em execução
    setCsrfToken('bff-csrf-active-token')
    return createDemoSession('FAMILIAR')
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
