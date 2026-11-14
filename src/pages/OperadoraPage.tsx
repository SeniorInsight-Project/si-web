import { useState } from 'react'
import { Icon } from '../components/Icon'
import { TrendChart } from '../components/TrendChart'
import { useOperadoraOverview } from '../hooks/usePortalData'
import type { RiskBand, TrendPeriod } from '../services/portalService'

function formatCohortBand(band: RiskBand) {
  switch (band) {
    case 'ESTAVEL':
      return { label: 'Estável', tone: 'green' as const }
    case 'ATENCAO':
      return { label: 'Atenção', tone: 'amber' as const }
    case 'CRITICO':
      return { label: 'Crítico', tone: 'coral' as const }
  }
}

export function OperadoraPage() {
  const [period, setPeriod] = useState<TrendPeriod>('30d')
  const { data } = useOperadoraOverview(period)

  if (!data) {
    return (
      <div className="portal-page">
        <p className="portal-muted">Carregando portal da operadora…</p>
      </div>
    )
  }

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área da Operadora (B2B)</span>
          <h1>Carteira Preventiva · {data.operatorName}</h1>
          <p className="portal-muted">
            Estratificação de risco populacional sem identificação nominal de titulares (LGPD).
          </p>
        </div>
        <span className="micro-pill micro-pill--green">
          <Icon name="shield" size={14} /> Dados agregados e pseudonimizados
        </span>
      </header>

      <section className="portal-grid portal-grid--4" aria-label="Indicadores da carteira">
        <div className="portal-stat-card">
          <span className="portal-muted">Vidas monitoradas</span>
          <strong>{data.totalLives}</strong>
          <small>Beneficiários ativos na carteira</small>
        </div>
        <div className="portal-stat-card portal-stat-card--green">
          <span className="portal-muted">Faixa Estável</span>
          <strong>{data.stableCount}</strong>
          <small>86,2% da carteira</small>
        </div>
        <div className="portal-stat-card portal-stat-card--amber">
          <span className="portal-muted">Faixa Atenção</span>
          <strong>{data.attentionCount}</strong>
          <small>11,2% da carteira</small>
        </div>
        <div className="portal-stat-card portal-stat-card--coral">
          <span className="portal-muted">Faixa Crítico</span>
          <strong>{data.criticalCount}</strong>
          <small>2,6% em acompanhamento prioritário</small>
        </div>
      </section>

      <section className="portal-grid portal-grid--2" aria-label="Carteira e importação">
        <article className="portal-card">
          <h2>Amostra da carteira por faixa de risco</h2>
          <p className="portal-muted">
            Códigos pseudonimizados gerados para coordenação de cuidado preventivo.
          </p>
          <div className="portal-table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Faixa etária</th>
                  <th>Faixa / Score</th>
                  <th>Alertas ativos</th>
                  <th>Sincronização</th>
                </tr>
              </thead>
              <tbody>
                {data.cohort.map((row) => {
                  const badge = formatCohortBand(row.riskBand)
                  return (
                    <tr key={row.code}>
                      <td>
                        <strong>{row.code}</strong>
                      </td>
                      <td>{row.ageGroup}</td>
                      <td>
                        <span className={`portal-band-pill portal-band-pill--${badge.tone}`}>
                          {badge.label} ({row.riskScore})
                        </span>
                      </td>
                      <td>{row.activeAlerts}</td>
                      <td>{row.lastSync}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="portal-card">
          <h2>Importação de beneficiários</h2>
          <p className="portal-muted">
            Sincronização cadastral em lote de vidas elegíveis ao programa preventivo.
          </p>
          <div className="portal-highlight-box">
            <strong>Último lote: {data.lastImportBatch.fileName}</strong>
            <p className="portal-muted">
              Processado em {data.lastImportBatch.processedAt} · {data.lastImportBatch.importedLives} vidas ({data.lastImportBatch.status})
            </p>
          </div>
          <ul className="checklist">
            <li>
              <Icon name="check" size={18} /> Validação de elegibilidade e vínculo com o care-service
            </li>
            <li>
              <Icon name="check" size={18} /> Relatório populacional sem exposição de dados sensíveis brutos
            </li>
            <li>
              <Icon name="check" size={18} /> Faturamento B2B integrado ao billing-service
            </li>
          </ul>
        </article>
      </section>

      <TrendChart
        title="Evolução do Score médio da carteira monitorada"
        subtitle="Acompanhamento de 7 e 30 dias dos indicadores agregados da carteira B2B"
        data={data.trends}
        period={period}
        onPeriodChange={setPeriod}
      />
    </div>
  )
}
