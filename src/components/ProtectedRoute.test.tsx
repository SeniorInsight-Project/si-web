import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SessionContext, type SessionContextValue } from '../hooks/useSession'
import { UNAUTHENTICATED_SESSION, type PortalRole } from '../services/authService'
import { ProtectedRoute } from './SessionProvider'

function contextWith(roles: PortalRole[] | null): SessionContextValue {
  const session =
    roles === null
      ? UNAUTHENTICATED_SESSION
      : {
          ...UNAUTHENTICATED_SESSION,
          authenticated: true,
          user: { sub: 'abc', name: 'Ana', email: '', roles },
        }

  return {
    session,
    isLoading: false,
    isAuthenticated: session.authenticated,
    loginWithKeycloak: vi.fn(),
    logout: vi.fn(),
  }
}

function renderRoute(roles: PortalRole[] | null, requiredRole?: PortalRole) {
  return render(
    <SessionContext.Provider value={contextWith(roles)}>
      <ProtectedRoute requiredRole={requiredRole}>
        <p>conteúdo protegido</p>
      </ProtectedRoute>
    </SessionContext.Provider>,
  )
}

afterEach(cleanup)

describe('ProtectedRoute', () => {
  it('sem sessão, não mostra o conteúdo', () => {
    renderRoute(null)

    expect(screen.queryByText('conteúdo protegido')).toBeNull()
    expect(screen.getByRole('region', { name: 'Autenticação necessária' })).toBeTruthy()
  })

  it('papel ausente bloqueia a rota e não oferece troca de perfil', () => {
    renderRoute(['FAMILIAR'], 'EQUIPE')

    expect(screen.queryByText('conteúdo protegido')).toBeNull()
    expect(screen.getByRole('region', { name: 'Acesso restrito ao perfil' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /alternar/i })).toBeNull()
  })

  it('sessão sem nenhum papel bloqueia a rota', () => {
    renderRoute([], 'FAMILIAR')

    expect(screen.queryByText('conteúdo protegido')).toBeNull()
  })

  it('com o papel exigido, mostra o conteúdo', () => {
    renderRoute(['MEDICO'], 'MEDICO')

    expect(screen.getByText('conteúdo protegido')).toBeTruthy()
  })
})
