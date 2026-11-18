import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { SessionContext, type SessionContextValue } from '../hooks/useSession'
import { UNAUTHENTICATED_SESSION, type PortalRole } from '../services/authService'

export type RotaFalsa = [RegExp, number, unknown, string?]

/** Responde ao fetch pela primeira rota que casar com a URL (e com o método, se informado). */
export function responder(rotas: RotaFalsa[]) {
  const fetchFalso = vi.fn((url: string, init?: RequestInit) => {
    const metodo = (init?.method ?? 'GET').toUpperCase()
    const rota = rotas.find(([padrao, , , m]) => padrao.test(url) && (!m || m === metodo))
    if (!rota) {
      return Promise.resolve(new Response(null, { status: 404 }))
    }
    const [, status, corpo] = rota
    return Promise.resolve(
      new Response(corpo === undefined ? null : JSON.stringify(corpo), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
  vi.stubGlobal('fetch', fetchFalso)
  return fetchFalso
}

export function sessao(roles: PortalRole[] | null, extra: Partial<SessionContextValue> = {}): SessionContextValue {
  const session =
    roles === null
      ? UNAUTHENTICATED_SESSION
      : { ...UNAUTHENTICATED_SESSION, authenticated: true, user: { sub: 'sub-1', name: 'Ana Souza', email: '', roles } }
  return {
    session,
    isLoading: false,
    isAuthenticated: session.authenticated,
    isUnavailable: false,
    isRetrying: false,
    retry: vi.fn(),
    loginWithKeycloak: vi.fn(),
    logout: vi.fn(),
    ...extra,
  }
}

export function renderizar(ui: ReactNode, contexto: SessionContextValue, rota = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <SessionContext.Provider value={contexto}>
        <MemoryRouter initialEntries={[rota]}>{ui}</MemoryRouter>
      </SessionContext.Provider>
    </QueryClientProvider>,
  )
}
