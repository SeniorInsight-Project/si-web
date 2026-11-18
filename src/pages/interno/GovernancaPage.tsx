import { useEffect } from 'react'
import { ProtectedRoute } from '../../components/SessionProvider'
import { useSession } from '../../hooks/useSession'

/**
 * Área interna da equipe. Fica fora do /portal, sem link em nenhum menu, e exige o papel
 * EQUIPE. O endereço não é segredo: a proteção é o papel na sessão, conferido também pelo
 * backend em qualquer rota que esta página venha a usar.
 */
export function GovernancaPage() {
  useNoIndex()

  return (
    <div className="interno-shell">
      <InternoHeader />
      <main className="container interno-main">
        <ProtectedRoute requiredRole="EQUIPE">
          <section className="portal-card" aria-labelledby="governanca-titulo">
            <span className="eyebrow">Interno</span>
            <h1 id="governanca-titulo">Governança</h1>
            <p className="portal-muted">
              Em construção. Esta área vai reunir os pedidos dos titulares (LGPD) e o acompanhamento
              operacional quando as rotas do backend existirem.
            </p>
          </section>
        </ProtectedRoute>
      </main>
    </div>
  )
}

function InternoHeader() {
  const { isAuthenticated, session, logout } = useSession()

  return (
    <header className="interno-header">
      <div className="container interno-header__inner">
        <strong>SeniorInsight · Interno</strong>
        {isAuthenticated ? (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => void logout()}>
            Sair{session.user?.name ? ` (${session.user.name.split(' ')[0]})` : ''}
          </button>
        ) : null}
      </div>
    </header>
  )
}

/** Reforça o X-Robots-Tag do vercel.json para robôs que leem só o HTML. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      meta.remove()
    }
  }, [])
}
