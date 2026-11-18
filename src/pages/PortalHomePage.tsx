import { Link, Navigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ProtectedRoute } from '../components/SessionProvider'
import { useSession } from '../hooks/useSession'
import { viewsForRoles } from '../portalViews'
import { lerConvitePendente } from '../services/medicoApi'

export function PortalHomePage() {
  return (
    <ProtectedRoute>
      <PortalViews />
    </ProtectedRoute>
  )
}

/** Mostra só as visões dos papéis da sessão; com uma só, vai direto para ela. */
function PortalViews() {
  const { session } = useSession()
  const views = viewsForRoles(session.user?.roles ?? [])

  // Volta do login com um convite aberto: o BFF sempre leva a /portal.
  if (lerConvitePendente()) {
    return <Navigate to="/portal/convite" replace />
  }

  if (views.length === 1) {
    return <Navigate to={views[0].to} replace />
  }

  if (views.length === 0) {
    return (
      <section className="portal-card portal-auth-gate" aria-label="Sem área disponível">
        <h2>Sua conta ainda não tem acesso ao portal</h2>
        <p className="portal-muted">
          O acesso de familiar começa pelo aplicativo SeniorInsight. Médicos entram pelo convite
          enviado pela família, e operadoras recebem o acesso da nossa equipe.
        </p>
      </section>
    )
  }

  return (
    <div className="portal-page">
      <header className="portal-hero-banner">
        <div>
          <span className="eyebrow">Portal SeniorInsight</span>
          <h1>Escolha a área</h1>
        </div>
      </header>

      <section className="portal-grid portal-grid--2" aria-label="Áreas do portal">
        {views.map((view) => (
          <article key={view.to} className="portal-card portal-profile-card">
            <div className="portal-profile-card__top">
              <span className={`feature__icon feature__icon--${view.tone}`}>
                <Icon name={view.icon} size={24} />
              </span>
              <span className="tag tag--blue">{view.badge}</span>
            </div>

            <h2>{view.title}</h2>
            <p>{view.description}</p>

            <div className="portal-profile-card__footer">
              <Link to={view.to} className="btn btn--navy btn--small">
                Acessar {view.title} <Icon name="arrow" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
