import { Icon } from './Icon'

type AreaEmBreveProps = {
  area: string
  description: string
  backendNeeds: string[]
}

export function AreaEmBreve({ area, description, backendNeeds }: AreaEmBreveProps) {
  return (
    <div className="portal-page">
      <section className="portal-card portal-auth-gate" aria-label={`${area} em breve`}>
        <div className="portal-card__title-row">
          <span className="feature__icon feature__icon--blue">
            <Icon name="activity" size={24} />
          </span>
          <div>
            <span className="eyebrow">{area}</span>
            <h1>Em breve</h1>
            <p className="portal-muted">{description}</p>
          </div>
        </div>

        <div>
          <h2>Dependências de backend</h2>
          <ul className="checklist">
            {backendNeeds.map((need) => (
              <li key={need}>
                <Icon name="activity" size={18} /> {need}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
