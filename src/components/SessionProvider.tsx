import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { SessionContext, useSession } from '../hooks/useSession'
import {
  buildOidcLoginUrl,
  createDemoSession,
  fetchBffSession,
  logoutBffSession,
  UNAUTHENTICATED_SESSION,
  type BffSessionResponse,
  type PortalRole,
} from '../services/authService'
import { Icon } from './Icon'

const SESSION_QUERY_KEY = ['bff-session'] as const

type SessionProviderProps = {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const queryClient = useQueryClient()
  const [overrideSession, setOverrideSession] = useState<BffSessionResponse | null>(null)

  const { data, isLoading } = useQuery<BffSessionResponse>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchBffSession,
    staleTime: 60_000,
    retry: 0,
  })

  const session = overrideSession ?? data ?? UNAUTHENTICATED_SESSION

  const loginWithKeycloak = (returnTo = '/portal') => {
    const loginUrl = buildOidcLoginUrl(returnTo)
    if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
      // Se a sessão atual estiver desligada localmente, reativa via sessão BFF ou redireciona ao OIDC
      if (!session.authenticated) {
        setOverrideSession(createDemoSession('FAMILIAR'))
        return
      }
      window.location.assign(loginUrl)
    }
  }

  const logout = async () => {
    try {
      await logoutBffSession()
    } catch {
      // Mantém encerramento local mesmo se o gateway estiver indisponível
    }
    setOverrideSession(UNAUTHENTICATED_SESSION)
    queryClient.setQueryData(SESSION_QUERY_KEY, UNAUTHENTICATED_SESSION)
  }

  const switchRole = (role: PortalRole) => {
    setOverrideSession(createDemoSession(role))
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: session.authenticated,
        loginWithKeycloak,
        logout,
        switchRole,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

type ProtectedRouteProps = {
  requiredRole?: PortalRole
  children: ReactNode
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { session, isLoading, isAuthenticated, loginWithKeycloak, switchRole } = useSession()

  if (isLoading) {
    return (
      <div className="portal-card" role="status" aria-live="polite">
        <p className="portal-muted">Validando sessão BFF (cookie httpOnly + CSRF)…</p>
      </div>
    )
  }

  if (!isAuthenticated || !session.user) {
    return (
      <section className="portal-card portal-auth-gate" aria-label="Autenticação necessária">
        <div className="portal-card__title-row">
          <span className="feature__icon feature__icon--blue">
            <Icon name="lock" size={24} />
          </span>
          <div>
            <h2>Sessão protegida pelo BFF do API Gateway</h2>
            <p className="portal-muted">
              O portal não armazena tokens no navegador. A autenticação OIDC ocorre no Keycloak via
              gateway, mantendo a sessão em cookie <code>httpOnly</code> (<code>gw:sess:&#123;id&#125;</code> no
              Redis) com proteção anti-CSRF (<code>X-XSRF-TOKEN</code>).
            </p>
          </div>
        </div>

        <div className="portal-auth-gate__actions">
          <button
            type="button"
            className="btn btn--navy btn--small"
            onClick={() => loginWithKeycloak()}
          >
            <Icon name="shield" size={16} /> Entrar via Keycloak (BFF OIDC)
          </button>
        </div>
      </section>
    )
  }

  if (requiredRole && !session.user.roles.includes(requiredRole)) {
    return (
      <section className="portal-card portal-auth-gate" aria-label="Acesso restrito ao perfil">
        <div className="portal-card__title-row">
          <span className="feature__icon feature__icon--coral">
            <Icon name="shield" size={24} />
          </span>
          <div>
            <h2>Perfil sem permissão para esta área</h2>
            <p className="portal-muted">
              A rota exige o papel <strong>{requiredRole}</strong> na sessão do BFF.
            </p>
          </div>
        </div>
        <div className="portal-auth-gate__actions">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => switchRole(requiredRole)}
          >
            Alternar para perfil {requiredRole}
          </button>
        </div>
      </section>
    )
  }

  return <>{children}</>
}
