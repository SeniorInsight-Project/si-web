import { useState } from 'react'
import { Icon } from '../components/Icon'
import { TrendChart } from '../components/TrendChart'
import { useFamiliarOverview } from '../hooks/usePortalData'
import type { RiskBand, TrendPeriod } from '../services/portalService'

function getRiskBadge(band: RiskBand) {
  switch (band) {
    case 'ESTAVEL':
      return { label: 'Estável', tone: 'green' as const }
    case 'ATENCAO':
      return { label: 'Atenção', tone: 'amber' as const }
    case 'CRITICO':
      return { label: 'Crítico', tone: 'coral' as const }
  }
}

export function FamiliarPage() {
  const [period, setPeriod] = useState<TrendPeriod>('7d')
  const { data } = useFamiliarOverview(period)

  if (!data) {
    return (
      <div className="portal-page">
        <p className="portal-muted">Carregando painel do familiar…</p>
      </div>
    )
  }

  const badge = getRiskBadge(data.riskBand)

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área do Familiar</span>
          <h1>Painel de Acompanhamento · {data.elderName}</h1>
          <p className="portal-muted">
            {data.elderAge} anos · {data.lastUpdated}
          </p>
        </div>
        <span className={`portal-band-pill portal-band-pill--${badge.tone}`}>
          Semáforo: {badge.label} (Score {data.riskScore}/100)
        </span>
      </header>

      <section className="portal-grid portal-grid--3" aria-label="Resumo do bem-estar">
        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--green">
              <Icon name="sparkles" size={22} />
            </span>
            <div>
              <h2>Semáforo &amp; Insight IA</h2>
              <small className="portal-muted">Faixa {badge.label} · Score {data.riskScore}</small>
            </div>
          </div>
          <p>{data.aiSummary}</p>
        </article>

        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--blue">
              <Icon name="pill" size={22} />
            </span>
            <div>
              <h2>Rotina de medicamentos</h2>
              <small className="portal-muted">Confirmações de hoje</small>
            </div>
          </div>
          <ul className="portal-list">
            {data.recentDoses.map((dose) => (
              <li key={`${dose.medicine}-${dose.time}`} className="portal-list__item">
                <div>
                  <strong>{dose.medicine}</strong>
                  <small>{dose.dosage} · {dose.time}</small>
                </div>
                <span className={`micro-pill micro-pill--${dose.confirmed ? 'green' : 'blue'}`}>
                  {dose.confirmed ? 'Confirmado' : 'Agendado'}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--purple">
              <Icon name="shield" size={22} />
            </span>
            <div>
              <h2>Assinatura &amp; Rede</h2>
              <small className="portal-muted">{data.subscriptionPlan}</small>
            </div>
          </div>
          <p className="portal-highlight-box">{data.subscriptionStatus}</p>
          <ul className="portal-list">
            {data.careNetwork.map((member) => (
              <li key={member.name} className="portal-list__item">
                <div>
                  <strong>{member.name}</strong>
                  <small>{member.role}</small>
                </div>
                <span className="portal-muted">{member.status}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <TrendChart
        title="Tendências de sinais vitais e Score de Risco"
        subtitle="Histórico consolidado dos wearables (Open Wearables / Health Connect) em janelas de 7 e 30 dias"
        data={data.trends}
        period={period}
        onPeriodChange={setPeriod}
      />
    </div>
  )
}
