import { PORTAL_ROLES, type BffSessionResponse } from './authService'

/**
 * Sessão local para desenvolver o portal sem o gateway. Só é carregada quando
 * `import.meta.env.DEV` e `VITE_MODO_DEMO=true` (ver `fetchBffSession`),
 * por isso não entra no build de produção.
 */
export function createDemoSession(): BffSessionResponse {
  return {
    authenticated: true,
    sessionKeyPrefix: 'gw:sess',
    csrfHeaderName: 'X-XSRF-TOKEN',
    csrfProtected: false,
    user: {
      sub: 'demo-local',
      name: 'Sessão de demonstração (local)',
      email: '',
      roles: [...PORTAL_ROLES],
    },
  }
}
