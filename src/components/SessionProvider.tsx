import { useQuery, useQueryClient } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { SessionContext, useSession } from '../hooks/useSession'
import {
  buildOidcLoginUrl,
  fetchBffSession,
  logoutBffSession,
  UNAUTHENTICATED_SESSION,
  type BffSessionResponse,
  type PortalRole,
} from '../services/authService'
import { Icon } from './Icon'

const SESSION_QUERY_KEY = ['bff-session'] as const

const ROLE_LABELS: Record<PortalRole, string> = {
  FAMILIAR: 'Familiar',
  MEDICO: 'Médico',
  OPERADORA: 'Operadora',
  EQUIPE: 'Equipe',
}

type SessionProviderProps = {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isFetching, refetch } = useQuery<BffSessionResponse>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchBffSession,
    staleTime: 60_000,
    retry: 0,
  })

  const session = data ?? UNAUTHENTICATED_SESSION

  const loginWithKeycloak = () => {
    if (typeof window !== 'undefined') {
      window.location.assign(buildOidcLoginUrl())
    }
  }

  const logout = async () => {
    let navegando = false
    try {
      navegando = await logoutBffSession()
    } catch {
      // Sem o gateway, encerra só o estado local
    }
    if (!navegando) {
      queryClient.setQueryData(SESSION_QUERY_KEY, UNAUTHENTICATED_SESSION)
    }
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: session.authenticated,
        isUnavailable: Boolean(session.unavailable),
        isRetrying: isFetching && !isLoading,
        retry: () => void refetch(),
        loginWithKeycloak,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

/** Tela de serviço indisponível, com nova tentativa. */
export function ServiceUnavailable() {
  const { retry, isRetrying } = useSession()

  return (
    <section className="portal-card portal-auth-gate" aria-label="Serviço indisponível">
      <div className="portal-card__title-row">
        <span className="feature__icon feature__icon--coral">
          <Icon name="activity" size={24} />
        </span>
        <div>
          <h2>Serviço indisponível</h2>
          <p className="portal-muted">
            Não conseguimos verificar sua sessão agora. Tente de novo em alguns instantes.
          </p>
        </div>
      </div>
      <div className="portal-auth-gate__actions">
        <button
          type="button"
          className="btn btn--navy btn--small"
          onClick={retry}
          disabled={isRetrying}
        >
          {isRetrying ? 'Tentando…' : 'Tentar de novo'}
        </button>
      </div>
    </section>
  )
}

type ProtectedRouteProps = {
  requiredRole?: PortalRole
  children: ReactNode
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { session, isLoading, isAuthenticated, isUnavailable, loginWithKeycloak } = useSession()

  if (isLoading) {
    return (
      <div className="portal-card" role="status" aria-live="polite">
        <p className="portal-muted">Verificando sua sessão…</p>
      </div>
    )
  }

  if (isUnavailable) {
    return <ServiceUnavailable />
  }

  if (!isAuthenticated || !session.user) {
    return (
      <section className="portal-card portal-auth-gate" aria-label="Autenticação necessária">
        <div className="portal-card__title-row">
          <span className="feature__icon feature__icon--blue">
            <Icon name="lock" size={24} />
          </span>
          <div>
            <h2>Entre para acessar o portal</h2>
            <p className="portal-muted">
              Use a mesma conta do aplicativo SeniorInsight.
            </p>
          </div>
        </div>

        <div className="portal-auth-gate__actions">
          <button
            type="button"
            className="btn btn--navy btn--small"
            onClick={() => loginWithKeycloak()}
          >
            <Icon name="shield" size={16} /> Entrar
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
            <h2>Sua conta não tem acesso a esta área</h2>
            <p className="portal-muted">
              Esta área é do perfil <strong>{ROLE_LABELS[requiredRole]}</strong>.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return <>{children}</>
}
