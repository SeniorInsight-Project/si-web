import { useState } from 'react'
import { Icon } from '../components/Icon'
import { TrendChart } from '../components/TrendChart'
import { useMedicoOverview } from '../hooks/usePortalData'
import type { RiskBand, TrendPeriod } from '../services/portalService'

function formatBandLabel(band: RiskBand) {
  switch (band) {
    case 'ESTAVEL':
      return { label: 'Estável', tone: 'green' as const }
    case 'ATENCAO':
      return { label: 'Atenção', tone: 'amber' as const }
    case 'CRITICO':
      return { label: 'Crítico', tone: 'coral' as const }
  }
}

export function MedicoPage() {
  const [period, setPeriod] = useState<TrendPeriod>('7d')
  const { data } = useMedicoOverview(period)

  if (!data) {
    return (
      <div className="portal-page">
        <p className="portal-muted">Carregando portal do médico…</p>
      </div>
    )
  }

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área do Médico</span>
          <h1>Meus Pacientes · {data.doctorName}</h1>
          <p className="portal-muted">{data.specialty}</p>
        </div>
        <span className="micro-pill micro-pill--blue">
          <Icon name="lock" size={14} /> {data.readOnlyNotice}
        </span>
      </header>

      <section className="portal-card" aria-label="Lista de pacientes vinculados">
        <div className="portal-card__header-inline">
          <div>
            <h2>Pacientes acompanhados ({data.patients.length})</h2>
            <p className="portal-muted">
              Visão clínica longitudinal e relatórios semanais em PDF gerados pelo report-service.
            </p>
          </div>
        </div>

        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Comorbidades</th>
                <th>Faixa / Score</th>
                <th>Última atualização</th>
                <th>Relatório semanal (PDF)</th>
              </tr>
            </thead>
            <tbody>
              {data.patients.map((patient) => {
                const badge = formatBandLabel(patient.riskBand)
                return (
                  <tr key={patient.id}>
                    <td>
                      <strong>{patient.name}</strong>
                      <small className="portal-table__sub">{patient.age} anos</small>
                    </td>
                    <td>{patient.comorbidities.join(' · ')}</td>
                    <td>
                      <span className={`portal-band-pill portal-band-pill--${badge.tone}`}>
                        {badge.label} ({patient.riskScore})
                      </span>
                    </td>
                    <td>{patient.lastUpdated}</td>
                    <td>
                      <span className="portal-report-badge">
                        <Icon name="clipboard" size={15} /> {patient.latestReportDate}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <TrendChart
        title="Evolução clínica longitudinal do paciente selecionado"
        subtitle="Séries de 7 e 30 dias para apoio à decisão clínica (modo somente leitura)"
        data={data.trends}
        period={period}
        onPeriodChange={setPeriod}
        defaultMetric="heartRate"
      />
    </div>
  )
}
