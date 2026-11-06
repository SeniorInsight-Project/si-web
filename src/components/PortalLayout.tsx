import { Link, NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/figma/logo-seniorinsight.png'
import { useBackendHealth } from '../hooks/useBackendHealth'
import { Icon, type IconName } from './Icon'

const PORTAL_NAV_ITEMS: {
  to: string
  label: string
  icon: IconName
  end?: boolean
}[] = [
  { to: '/portal', label: 'Visão geral', icon: 'sparkles', end: true },
  { to: '/portal/familiar', label: 'Familiar', icon: 'heart' },
  { to: '/portal/medico', label: 'Médico', icon: 'clipboard' },
  { to: '/portal/operadora', label: 'Operadora', icon: 'users' },
  { to: '/portal/equipe', label: 'Equipe', icon: 'shield' },
]

export function PortalLayout() {
  const { data: health, isLoading, isError } = useBackendHealth()

  const gatewayStatusLabel = isLoading
    ? 'Verificando API Gateway…'
    : isError
      ? 'Gateway offline (modo demonstração)'
      : `Gateway online (${health?.status ?? 'UP'})`

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

          <nav className="portal-nav" aria-label="Áreas do portal por perfil">
            {PORTAL_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `portal-nav__link ${isActive ? 'is-active' : ''}`
                }
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="portal-header__actions">
            <span
              className={`micro-pill micro-pill--${gatewayStatusTone}`}
              role="status"
              aria-live="polite"
            >
              <span className="portal-status-dot" />
              {gatewayStatusLabel}
            </span>
            <Link to="/" className="btn btn--ghost btn--small">
              Landing page
            </Link>
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
          <p>© {new Date().getFullYear()} SeniorInsight · Portal Web (Familiar, Médico, Operadora e Equipe).</p>
          <Link to="/">Voltar para a página inicial</Link>
        </div>
      </footer>
    </div>
  )
}
