import { useState } from 'react'
import { Icon } from '../components/Icon'
import { TrendChart } from '../components/TrendChart'
import { useEquipeOverview } from '../hooks/usePortalData'
import type { TrendPeriod } from '../services/portalService'

export function EquipePage() {
  const [period, setPeriod] = useState<TrendPeriod>('7d')
  const { data } = useEquipeOverview(period)

  if (!data) {
    return (
      <div className="portal-page">
        <p className="portal-muted">Carregando painel de governança da equipe…</p>
      </div>
    )
  }

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área da Equipe · Governança</span>
          <h1>Prompt IA, Limites Operacionais e LGPD</h1>
          <p className="portal-muted">
            Monitoramento técnico do insight-service (Gemini), SLAs de alerta e direitos dos titulares.
          </p>
        </div>
        <span className="micro-pill micro-pill--green">
          <Icon name="sparkles" size={14} /> Prompt ativo: {data.activePromptVersion}
        </span>
      </header>

      <section className="portal-grid portal-grid--3" aria-label="Métricas operacionais">
        <div className="portal-stat-card">
          <span className="portal-muted">Modelo e versão de prompt</span>
          <strong>{data.activePromptVersion}</strong>
          <small>{data.modelName}</small>
        </div>
        <div className="portal-stat-card">
          <span className="portal-muted">Cota diária Gemini utilizada</span>
          <strong>{data.dailyBudgetUsedPct}%</strong>
          <small>{data.dailyCallsCount} chamadas hoje (teto de 5.000/dia)</small>
        </div>
        <div className="portal-stat-card">
          <span className="portal-muted">Latência p95 de análise</span>
          <strong>{data.p95LatencyMs} ms</strong>
          <small>Com pseudonimização e validação JSON</small>
        </div>
      </section>

      <section className="portal-grid portal-grid--2" aria-label="Governança de prompts, limites e LGPD">
        <article className="portal-card">
          <h2>Versões de prompt e limites operacionais</h2>
          <p className="portal-muted">
            Apenas prompts homologados são enviados ao Gemini, com circuit breaker e teto diário.
          </p>
          <ul className="portal-list">
            {data.prompts.map((prompt) => (
              <li key={prompt.version} className="portal-list__item">
                <div>
                  <strong>{prompt.version}</strong>
                  <small>Atualizado em {prompt.updatedAt} · Média {prompt.avgTokens} tokens</small>
                </div>
                <span className="micro-pill micro-pill--green">{prompt.status}</span>
              </li>
            ))}
          </ul>

          <div className="portal-divider" />

          <ul className="portal-list">
            {data.limits.map((limit) => (
              <li key={limit.name} className="portal-list__item">
                <div>
                  <strong>{limit.name}</strong>
                  <small>{limit.current} · Meta: {limit.threshold}</small>
                </div>
                <span className="micro-pill micro-pill--blue">{limit.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="portal-card">
          <h2>Atendimento ao titular (LGPD)</h2>
          <p className="portal-muted">
            Coordenação de portabilidade/exportação e evento distribuído lgpd.erasure.requested.
          </p>
          <ul className="portal-list">
            {data.lgpdRequests.map((req) => (
              <li key={req.protocol} className="portal-list__item">
                <div>
                  <strong>{req.protocol} · {req.type}</strong>
                  <small>Solicitado em {req.requestedAt}</small>
                </div>
                <span
                  className={`micro-pill micro-pill--${
                    req.type === 'EXCLUSAO' ? 'coral' : 'green'
                  }`}
                >
                  {req.status}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <TrendChart
        title="Monitoramento de estabilidade e indicadores agregados"
        subtitle="Janela de 7 e 30 dias para auditoria da plataforma"
        data={data.trends}
        period={period}
        onPeriodChange={setPeriod}
      />
    </div>
  )
}
