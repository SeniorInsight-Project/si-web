import { useState } from 'react'
import { Icon } from '../components/Icon'
import { useSession } from '../hooks/useSession'
import { useFamiliarOverview } from '../hooks/usePortalData'
import type { RiskScore } from '../services/portalService'

function calculateAge(dateOfBirth: string): number | null {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) {
    return null
  }

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!birthdayHasPassed) {
    age -= 1
  }
  return age
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Sem atualização registrada'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function formatRiskBand(band: RiskScore['faixa']) {
  switch (band) {
    case 'VERDE':
      return { label: 'Verde', tone: 'green' as const }
    case 'AMARELO':
      return { label: 'Amarelo', tone: 'amber' as const }
    case 'VERMELHO':
      return { label: 'Vermelho', tone: 'coral' as const }
    default:
      return null
  }
}

function formatScoreState(state: RiskScore['estado']): string {
  switch (state) {
    case 'DISPONIVEL':
      return 'Score disponível'
    case 'CONHECENDO_ROTINA':
      return 'Conhecendo a rotina'
    case 'MONITORAMENTO_PAUSADO':
      return 'Monitoramento pausado'
    case 'SEM_ANALISE':
      return 'Sem análise disponível'
  }
}

function formatMedicationStatus(status?: string) {
  switch (status) {
    case 'TOMADO':
      return { label: 'Tomado', tone: 'green' as const }
    case 'ATRASADO':
      return { label: 'Atrasado', tone: 'coral' as const }
    case 'IGNORADO':
      return { label: 'Ignorado', tone: 'amber' as const }
    case 'PENDENTE':
      return { label: 'Pendente', tone: 'blue' as const }
    default:
      return null
  }
}

function LoadingText({ label }: { label: string }) {
  return <p className="portal-muted">Carregando {label}…</p>
}

function ErrorText({ label }: { label: string }) {
  return <p className="portal-muted" role="alert">Não foi possível carregar {label}.</p>
}

export function FamiliarPage() {
  const { session } = useSession()
  const familiarSub = session.user?.sub
  const [selectedElderIdOverride, setSelectedElderIdOverride] = useState<string>()
  const { elders, selectedElder, selectedElderId, score, telemetry, careNetwork, medications, entitlement } =
    useFamiliarOverview(familiarSub, selectedElderIdOverride)

  if (elders.isLoading) {
    return (
      <div className="portal-page">
        <section className="portal-card" role="status" aria-live="polite">
          <LoadingText label="os idosos vinculados ao familiar" />
        </section>
      </div>
    )
  }

  if (elders.isError) {
    return (
      <div className="portal-page">
        <section className="portal-card">
          <ErrorText label="os idosos vinculados ao familiar" />
        </section>
      </div>
    )
  }

  if (!elders.data?.length || !selectedElder || !selectedElderId) {
    return (
      <div className="portal-page">
        <section className="portal-card" aria-label="Nenhum idoso vinculado">
          <h1>Área do Familiar</h1>
          <p className="portal-muted">Nenhum idoso está vinculado a este familiar.</p>
        </section>
      </div>
    )
  }

  const riskBand = formatRiskBand(score.data?.faixa)
  const age = calculateAge(selectedElder.dataNascimento)
  const scoreIsEmpty = score.data?.score == null || !score.data.faixa
  const telemetryIsEmpty =
    telemetry.data?.passosHoje == null && telemetry.data?.frequenciaCardiaca == null

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área do Familiar</span>
          <h1>Painel de Acompanhamento · {selectedElder.nomeCompleto}</h1>
          <p className="portal-muted">
            {age === null ? 'Idade não informada' : `${age} anos`} · Dados atualizados pelo backend
          </p>
          {elders.data.length > 1 ? (
            <label className="portal-select-label">
              Idoso acompanhado
              <select
                className="portal-select"
                value={selectedElderId}
                onChange={(event) => setSelectedElderIdOverride(event.target.value)}
              >
                {elders.data.map((elder) => (
                  <option key={elder.id} value={elder.id}>
                    {elder.nomeCompleto}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        {score.isLoading ? (
          <span className="micro-pill micro-pill--blue">Carregando score…</span>
        ) : score.isError ? (
          <span className="micro-pill micro-pill--coral">Score indisponível</span>
        ) : riskBand && score.data?.score != null ? (
          <span className={`portal-band-pill portal-band-pill--${riskBand.tone}`}>
            Semáforo: {riskBand.label} (Score {score.data.score}/100)
          </span>
        ) : (
          <span className="micro-pill micro-pill--blue">Score sem análise</span>
        )}
      </header>

      <section className="portal-grid portal-grid--3" aria-label="Resumo do bem-estar">
        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--green">
              <Icon name="sparkles" size={22} />
            </span>
            <div>
              <h2>Semáforo &amp; Score</h2>
              <small className="portal-muted">
                {score.data ? formatScoreState(score.data.estado) : 'Resultado do insight-service'}
              </small>
            </div>
          </div>
          {score.isLoading ? <LoadingText label="o score de risco" /> : null}
          {score.isError ? <ErrorText label="o score de risco" /> : null}
          {!score.isLoading && !score.isError && scoreIsEmpty ? (
            <p className="portal-muted">O backend ainda não tem dados suficientes para calcular o score.</p>
          ) : null}
          {!score.isLoading && !score.isError && !scoreIsEmpty ? (
            <p>
              Faixa {riskBand?.label} · {score.data?.diasComDadosValidos} dias válidos.
              {score.data?.mensagem ? ` ${score.data.mensagem}` : ''}
            </p>
          ) : null}
        </article>

        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--blue">
              <Icon name="activity" size={22} />
            </span>
            <div>
              <h2>Dados de hoje</h2>
              <small className="portal-muted">Telemetria autorizada pelo idoso</small>
            </div>
          </div>
          {telemetry.isLoading ? <LoadingText label="passos e batimentos" /> : null}
          {telemetry.isError ? <ErrorText label="a telemetria de hoje" /> : null}
          {!telemetry.isLoading && !telemetry.isError && telemetryIsEmpty ? (
            <p className="portal-muted">Nenhum passo ou batimento foi recebido hoje.</p>
          ) : null}
          {!telemetry.isLoading && !telemetry.isError && !telemetryIsEmpty ? (
            <ul className="portal-list">
              <li className="portal-list__item">
                <div><strong>Passos</strong><small>Meta: {telemetry.data?.metaPassos ?? 'Não informada'}</small></div>
                <strong>{telemetry.data?.passosHoje ?? 'Sem dado'}</strong>
              </li>
              <li className="portal-list__item">
                <div><strong>Batimentos</strong><small>Repouso: {telemetry.data?.frequenciaCardiacaRepouso ?? 'Sem dado'} bpm</small></div>
                <strong>{telemetry.data?.frequenciaCardiaca ?? 'Sem dado'} bpm</strong>
              </li>
            </ul>
          ) : null}
          {telemetry.data?.coletadoEm ? (
            <small className="portal-muted">Coletado em {formatDateTime(telemetry.data.coletadoEm)}</small>
          ) : null}
        </article>

        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--purple">
              <Icon name="shield" size={22} />
            </span>
            <div>
              <h2>Plano</h2>
              <small className="portal-muted">Direito consultado no billing-service</small>
            </div>
          </div>
          {entitlement.isLoading ? <LoadingText label="o plano" /> : null}
          {entitlement.isError ? <ErrorText label="o plano" /> : null}
          {!entitlement.isLoading && !entitlement.isError && !entitlement.data ? (
            <p className="portal-muted">Nenhum direito de plano foi retornado.</p>
          ) : null}
          {entitlement.data ? (
            <>
              <p className="portal-highlight-box">Plano {entitlement.data.plano}</p>
              <p className="portal-muted">
                {entitlement.data.acessoPremium ? 'Acesso Premium disponível.' : 'Acesso Premium não disponível.'}
                {entitlement.data.acessoAte ? ` Até ${formatDateTime(entitlement.data.acessoAte)}.` : ''}
              </p>
            </>
          ) : null}
        </article>
      </section>

      <section className="portal-grid portal-grid--2" aria-label="Rede e medicamentos">
        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--coral">
              <Icon name="users" size={22} />
            </span>
            <div>
              <h2>Rede de proteção</h2>
              <small className="portal-muted">Membros autorizados para este idoso</small>
            </div>
          </div>
          {careNetwork.isLoading ? <LoadingText label="a rede de proteção" /> : null}
          {careNetwork.isError ? <ErrorText label="a rede de proteção" /> : null}
          {!careNetwork.isLoading && !careNetwork.isError && !careNetwork.data?.length ? (
            <p className="portal-muted">Nenhum membro da rede foi retornado.</p>
          ) : null}
          {careNetwork.data?.length ? (
            <ul className="portal-list">
              {careNetwork.data.map((member) => (
                <li key={member.vinculoId} className="portal-list__item">
                  <div>
                    <strong>{member.nomeCompleto}</strong>
                    <small>{member.grauParentesco ?? member.papelAcesso}</small>
                  </div>
                  <span className="portal-muted">{member.papelAcesso}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="portal-card">
          <div className="portal-card__title-row">
            <span className="feature__icon feature__icon--blue">
              <Icon name="pill" size={22} />
            </span>
            <div>
              <h2>Rotina de medicamentos</h2>
              <small className="portal-muted">Rotinas ativas do dia</small>
            </div>
          </div>
          {medications.isLoading ? <LoadingText label="as rotinas de medicamentos" /> : null}
          {medications.isError ? <ErrorText label="as rotinas de medicamentos" /> : null}
          {!medications.isLoading && !medications.isError && !medications.data?.length ? (
            <p className="portal-muted">Nenhuma rotina de medicamento foi retornada.</p>
          ) : null}
          {medications.data?.length ? (
            <ul className="portal-list">
              {medications.data.map((medication) => {
                const status = formatMedicationStatus(medication.statusHoje)
                return (
                  <li key={medication.id} className="portal-list__item">
                    <div>
                      <strong>{medication.medicamentoNome}</strong>
                      <small>
                        {medication.dosagem ?? 'Dosagem não informada'} · {medication.horario}
                      </small>
                    </div>
                    {status ? (
                      <span className={`micro-pill micro-pill--${status.tone}`}>{status.label}</span>
                    ) : (
                      <span className="portal-muted">Sem status</span>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </article>
      </section>
    </div>
  )
}
