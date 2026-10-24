import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'

const PORTAL_PROFILES: {
  to: string
  badge: string
  tone: 'green' | 'blue' | 'purple' | 'coral'
  icon: IconName
  title: string
  description: string
  highlights: string[]
}[] = [
  {
    to: '/portal/familiar',
    badge: 'B2C · Família',
    tone: 'green',
    icon: 'heart',
    title: 'Área do Familiar',
    description:
      'Semáforo do bem-estar em tempo real, gráficos de tendências de 7 e 30 dias, rede familiar e gestão da assinatura Premium.',
    highlights: ['Semáforo e Score de Risco', 'Tendências 7 e 30 dias (Recharts)', 'Rede familiar e assinatura'],
  },
  {
    to: '/portal/medico',
    badge: 'Clínico · Somente leitura',
    tone: 'blue',
    icon: 'clipboard',
    title: 'Área do Médico',
    description:
      'Lista de pacientes vinculados com autorização da família (RN-011), evolução longitudinal de sinais vitais e relatórios semanais em PDF.',
    highlights: ['Lista "Meus pacientes"', 'Evolução clínica 7 e 30 dias', 'Relatórios semanais em PDF'],
  },
  {
    to: '/portal/operadora',
    badge: 'B2B · Saúde Suplementar',
    tone: 'purple',
    icon: 'users',
    title: 'Área da Operadora',
    description:
      'Visão estratificada da carteira de beneficiários por faixa de risco (sem exposição nominal) e importação em lote.',
    highlights: ['Carteira por faixa de risco', 'Dados pseudonimizados (LGPD)', 'Importação de beneficiários'],
  },
  {
    to: '/portal/equipe',
    badge: 'Interno · Governança',
    tone: 'coral',
    icon: 'shield',
    title: 'Área da Equipe',
    description:
      'Governança de versões de prompt do Gemini, monitoramento de limites e SLAs operacionais e atendimento a requisições LGPD.',
    highlights: ['Versões de prompt e tokens', 'Limites e custos diários', 'Exportação e exclusão LGPD'],
  },
]

export function PortalHomePage() {
  return (
    <div className="portal-page">
      <header className="portal-hero-banner">
        <div>
          <span className="eyebrow">Portal SeniorInsight</span>
          <h1>Selecione a área de acesso do portal</h1>
          <p className="portal-muted">
            O portal web convive com a landing institucional e organiza o acesso por perfil
            (Familiar, Médico, Operadora e Equipe), consumindo o API Gateway com cache pelo TanStack Query.
          </p>
        </div>
      </header>

      <section className="portal-grid portal-grid--2" aria-label="Perfis do portal">
        {PORTAL_PROFILES.map((profile) => (
          <article key={profile.to} className="portal-card portal-profile-card">
            <div className="portal-profile-card__top">
              <span className={`feature__icon feature__icon--${profile.tone}`}>
                <Icon name={profile.icon} size={24} />
              </span>
              <span className={`tag tag--${profile.tone === 'coral' ? 'coral' : 'blue'}`}>
                {profile.badge}
              </span>
            </div>

            <h2>{profile.title}</h2>
            <p>{profile.description}</p>

            <ul className="checklist">
              {profile.highlights.map((item) => (
                <li key={item}>
                  <Icon name="check" size={18} /> {item}
                </li>
              ))}
            </ul>

            <div className="portal-profile-card__footer">
              <Link to={profile.to} className="btn btn--navy btn--small">
                Acessar {profile.title} <Icon name="arrow" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
