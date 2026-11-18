import { Link, NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/figma/logo-seniorinsight.png'
import { useBackendHealth } from '../hooks/useBackendHealth'
import { useSession } from '../hooks/useSession'
import { viewsForRoles } from '../portalViews'
import { Icon } from './Icon'

export function PortalLayout() {
  const { isLoading, isError } = useBackendHealth()
  const { session, isAuthenticated, loginWithKeycloak, logout } = useSession()
  const views = viewsForRoles(session.user?.roles ?? [])

  const gatewayStatusLabel = isLoading
    ? 'Verificando conexão…'
    : isError
      ? 'Serviço indisponível'
      : 'Conectado'

  const gatewayStatusTone = isLoading ? 'amber' : isError ? 'coral' : 'green'

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="container portal-header__inner">
          <div className="portal-header__brand">
            <Link to="/" className="nav__brand" aria-label="SeniorInsight, voltar à landing page">
              <img src={logo} alt="SeniorInsight" width={114} height={24} />
            </Link>
            <span className="tag tag--blue">Portal Web</span>
          </div>

          {views.length > 1 ? (
            <nav className="portal-nav" aria-label="Áreas do portal">
              {views.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `portal-nav__link ${isActive ? 'is-active' : ''}`
                  }
                >
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="portal-header__actions">
            <span
              className={`micro-pill micro-pill--${gatewayStatusTone}`}
              role="status"
              aria-live="polite"
            >
              <span className="portal-status-dot" />
              {gatewayStatusLabel}
            </span>

            {isAuthenticated ? (
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => void logout()}
              >
                Sair{session.user?.name ? ` (${session.user.name.split(' ')[0]})` : ''}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--navy btn--small"
                onClick={() => loginWithKeycloak()}
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="portal-main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <img src={logo} alt="SeniorInsight" width={114} height={24} />
          <p>© {new Date().getFullYear()} SeniorInsight · Portal Web</p>
          <Link to="/">Voltar para a página inicial</Link>
        </div>
      </footer>
    </div>
  )
}
