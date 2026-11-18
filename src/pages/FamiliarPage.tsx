import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { TrendChart } from '../components/TrendChart'
import {
  METRICA_BATIMENTOS,
  METRICA_PASSOS,
  METRICA_SCORE,
  type TrendPeriod,
} from '../components/trendMetrics'
import { ApiError } from '../services/api'
import {
  diaLocal,
  idade,
  intervaloDoPeriodo,
  listarAlertas,
  listarIdosos,
  listarRede,
  listarRotinasDoDia,
  montarPontosGrafico,
  obterDireito,
  obterEstadoAtual,
  obterHistoricoScore,
  obterScoreRecente,
  obterSerie,
  obterStatusAparelho,
  type Alerta,
  type Direito,
  type Idoso,
  type PapelAcesso,
  type ScoreRecente,
  type StatusIngestao,
} from '../services/familiarApi'

const FAIXAS: Record<NonNullable<ScoreRecente['faixa']>, { label: string; tone: 'green' | 'amber' | 'coral' }> = {
  VERDE: { label: 'Verde', tone: 'green' },
  AMARELO: { label: 'Amarelo', tone: 'amber' },
  VERMELHO: { label: 'Vermelho', tone: 'coral' },
}

const ESTADOS_SEM_SCORE: Record<Exclude<ScoreRecente['estado'], 'DISPONIVEL'>, string> = {
  CONHECENDO_ROTINA: 'Conhecendo a rotina',
  MONITORAMENTO_PAUSADO: 'Monitoramento pausado',
  SEM_ANALISE: 'Aguardando análise',
}

const DOSES: Record<StatusIngestao, { label: string; tone: 'green' | 'amber' | 'coral' | 'blue' }> = {
  TOMADO: { label: 'Tomado', tone: 'green' },
  ATRASADO: { label: 'Atrasado', tone: 'amber' },
  IGNORADO: { label: 'Não tomado', tone: 'coral' },
  PENDENTE: { label: 'Pendente', tone: 'blue' },
}

const PAPEIS: Record<PapelAcesso, string> = {
  ADMINISTRADOR: 'Administrador',
  CUIDADOR: 'Cuidador',
  OBSERVADOR: 'Observador',
  MEDICO: 'Médico',
}

const PLANOS: Record<Direito['plano'], string> = {
  FREE: 'Gratuito',
  TRIAL: 'Teste do Premium',
  PREMIUM: 'Premium',
}

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

function formatarDataHora(valor?: string | null): string {
  return valor ? dataHora.format(new Date(valor)) : '—'
}

/** Idosos acompanhados como familiar. Sem `papelAcesso` (backend antigo), entram todos. */
function idososDaFamilia(idosos: Idoso[]): Idoso[] {
  return idosos.filter((idoso) => idoso.papelAcesso !== 'MEDICO')
}

export function FamiliarPage() {
  const idososQuery = useQuery({ queryKey: ['familiar', 'idosos'], queryFn: () => listarIdosos() })
  const [selecionado, setSelecionado] = useState<string | null>(null)

  if (idososQuery.isLoading) {
    return (
      <div className="portal-page">
        <p className="portal-muted" role="status">
          Carregando…
        </p>
      </div>
    )
  }

  if (idososQuery.isError) {
    return (
      <div className="portal-page">
        <EstadoErro mensagem="Não foi possível carregar os idosos da sua rede." onRetry={() => void idososQuery.refetch()} />
      </div>
    )
  }

  const idosos = idososDaFamilia(idososQuery.data ?? [])
  if (idosos.length === 0) {
    return (
      <div className="portal-page">
        <section className="portal-card portal-auth-gate">
          <h2>Nenhum idoso na sua rede</h2>
          <p className="portal-muted">
            O cadastro do idoso e os convites da rede de proteção são feitos pelo aplicativo SeniorInsight.
          </p>
        </section>
      </div>
    )
  }

  const idoso = idosos.find((item) => item.id === selecionado) ?? idosos[0]

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área do Familiar</span>
          <h1>{idoso.nomeCompleto}</h1>
          <p className="portal-muted">{idade(idoso.dataNascimento)} anos</p>
        </div>
        {idosos.length > 1 ? (
          <label className="portal-select">
            <span className="portal-muted">Idoso acompanhado</span>
            <select value={idoso.id} onChange={(evento) => setSelecionado(evento.target.value)}>
              {idosos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nomeCompleto}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </header>

      <PainelIdoso key={idoso.id} idosoId={idoso.id} />
    </div>
  )
}

function PainelIdoso({ idosoId }: { idosoId: string }) {
  const hoje = diaLocal(new Date())
  const score = useQuery({ queryKey: ['familiar', idosoId, 'score'], queryFn: () => obterScoreRecente(idosoId) })
  const estado = useQuery({ queryKey: ['familiar', idosoId, 'hoje'], queryFn: () => obterEstadoAtual(idosoId) })
  const aparelho = useQuery({ queryKey: ['familiar', idosoId, 'status'], queryFn: () => obterStatusAparelho(idosoId) })
  const rotinas = useQuery({
    queryKey: ['familiar', idosoId, 'rotinas', hoje],
    queryFn: () => listarRotinasDoDia(idosoId, hoje),
  })
  const rede = useQuery({ queryKey: ['familiar', idosoId, 'rede'], queryFn: () => listarRede(idosoId) })
  const alertas = useQuery({ queryKey: ['familiar', idosoId, 'alertas'], queryFn: () => listarAlertas(idosoId) })
  const direito = useQuery({ queryKey: ['familiar', 'direito'], queryFn: obterDireito })

  return (
    <>
      <section className="portal-grid portal-grid--3" aria-label="Resumo do dia">
        <Bloco titulo="Semáforo de bem-estar" icone="sparkles" tom="green" query={score} erro={erroScore}>
          {(dado) => <CartaoScore score={dado} />}
        </Bloco>

        <Bloco titulo="Hoje" icone="activity" tom="coral" query={estado}>
          {(dado) => (
            <dl className="portal-facts">
              <div>
                <dt>Passos</dt>
                <dd>
                  {dado.passosHoje === null ? 'Não autorizado ou sem dado' : dado.passosHoje.toLocaleString('pt-BR')}
                  {dado.passosHoje !== null && dado.metaPassos ? ` de ${dado.metaPassos.toLocaleString('pt-BR')}` : ''}
                </dd>
              </div>
              <div>
                <dt>Batimentos</dt>
                <dd>{dado.frequenciaCardiaca === null ? 'Não autorizado ou sem dado' : `${dado.frequenciaCardiaca} bpm`}</dd>
              </div>
              {dado.frequenciaCardiacaRepouso ? (
                <div>
                  <dt>Em repouso</dt>
                  <dd>{dado.frequenciaCardiacaRepouso} bpm</dd>
                </div>
              ) : null}
              <div>
                <dt>Última leitura</dt>
                <dd>{formatarDataHora(dado.coletadoEm)}</dd>
              </div>
            </dl>
          )}
        </Bloco>

        <Bloco titulo="Celular do idoso" icone="phone" tom="blue" query={aparelho}>
          {(dado) => (
            <dl className="portal-facts">
              <div>
                <dt>Última sincronização</dt>
                <dd>{formatarDataHora(dado.ultimaSincronizacao)}</dd>
              </div>
              {dado.nivelBateria !== null && dado.nivelBateria !== undefined ? (
                <div>
                  <dt>Bateria</dt>
                  <dd>{dado.nivelBateria}%</dd>
                </div>
              ) : null}
              {dado.modeloCelular ? (
                <div>
                  <dt>Aparelho</dt>
                  <dd>
                    {dado.modeloCelular}
                    {dado.sistemaOperacional ? ` · ${dado.sistemaOperacional}` : ''}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Dados autorizados</dt>
                <dd>{dado.tiposAtivos.length ? dado.tiposAtivos.map(rotuloTipoDado).join(', ') : 'Nenhum'}</dd>
              </div>
            </dl>
          )}
        </Bloco>
      </section>

      <section className="portal-grid portal-grid--3" aria-label="Rotina, rede e alertas">
        <Bloco
          titulo="Remédios de hoje"
          icone="pill"
          tom="blue"
          query={rotinas}
          vazio={(lista) => lista.length === 0}
          mensagemVazio="Nenhum remédio programado para hoje."
        >
          {(lista) => (
            <ul className="portal-list">
              {[...lista]
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((rotina) => {
                  const status = DOSES[rotina.statusHoje ?? 'PENDENTE']
                  return (
                    <li key={rotina.id} className="portal-list__item">
                      <div>
                        <strong>{rotina.medicamentoNome}</strong>
                        <small>
                          {rotina.dosagem ? `${rotina.dosagem} · ` : ''}
                          {rotina.horario}
                        </small>
                      </div>
                      <span className={`micro-pill micro-pill--${status.tone}`}>{status.label}</span>
                    </li>
                  )
                })}
            </ul>
          )}
        </Bloco>

        <Bloco
          titulo="Rede de proteção"
          icone="users"
          tom="purple"
          query={rede}
          vazio={(lista) => lista.length === 0}
          mensagemVazio="Ninguém na rede ainda."
        >
          {(lista) => (
            <ul className="portal-list">
              {lista.map((membro) => (
                <li key={membro.vinculoId} className="portal-list__item">
                  <div>
                    <strong>{membro.nomeCompleto}</strong>
                    <small>
                      {PAPEIS[membro.papelAcesso]}
                      {membro.grauParentesco ? ` · ${membro.grauParentesco}` : ''}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco
          titulo="Alertas recentes"
          icone="bell"
          tom="amber"
          query={alertas}
          vazio={(lista) => lista.length === 0}
          mensagemVazio="Nenhum alerta enviado à rede."
        >
          {(lista) => <ListaAlertas alertas={lista} />}
        </Bloco>
      </section>

      <Bloco titulo="Assinatura" icone="heart" tom="green" query={direito}>
        {(dado) => <CartaoAssinatura direito={dado} />}
      </Bloco>

      <GraficoIdoso idosoId={idosoId} />
    </>
  )
}

function GraficoIdoso({ idosoId }: { idosoId: string }) {
  const [periodo, setPeriodo] = useState<TrendPeriod>('7d')
  const { de, ate } = intervaloDoPeriodo(periodo)
  const serie = useQuery({
    queryKey: ['familiar', idosoId, 'serie', de, ate],
    queryFn: () => obterSerie(idosoId, de, ate),
  })
  // Sem Premium/trial o histórico do score responde 403: o gráfico segue só com passos e batimentos.
  const historico = useQuery({
    queryKey: ['familiar', idosoId, 'historico-score', de, ate],
    queryFn: () => obterHistoricoScore(idosoId, de, ate),
    retry: (falhas, erro) => !(erro instanceof ApiError && erro.status === 403) && falhas < 2,
  })

  const metricas = [METRICA_PASSOS, METRICA_BATIMENTOS, ...(historico.isSuccess ? [METRICA_SCORE] : [])]
  const pontos = montarPontosGrafico(de, ate, serie.data, historico.data)

  return (
    <TrendChart
      title="Evolução"
      subtitle="Passos e batimentos por dia, a partir dos dados do relógio, e o score de bem-estar."
      data={pontos}
      metrics={metricas}
      period={periodo}
      onPeriodChange={setPeriodo}
      isLoading={serie.isLoading}
      isError={serie.isError}
      onRetry={() => void serie.refetch()}
    />
  )
}

function CartaoScore({ score }: { score: ScoreRecente }) {
  if (score.estado !== 'DISPONIVEL' || !score.faixa) {
    return (
      <>
        <p>
          <strong>{score.estado === 'DISPONIVEL' ? 'Aguardando análise' : ESTADOS_SEM_SCORE[score.estado]}</strong>
        </p>
        {score.mensagem ? <p className="portal-muted">{score.mensagem}</p> : null}
        <small className="portal-muted">{score.aviso}</small>
      </>
    )
  }

  const faixa = FAIXAS[score.faixa]
  return (
    <>
      <span className={`portal-band-pill portal-band-pill--${faixa.tone}`}>
        {faixa.label}
        {typeof score.score === 'number' ? ` · ${Math.round(score.score)}/100` : ''}
      </span>
      {score.mensagem ? <p className="portal-muted">{score.mensagem}</p> : null}
      {score.fatores.length ? (
        <ul className="portal-bullets">
          {score.fatores.map((fator) => (
            <li key={fator}>{fator}</li>
          ))}
        </ul>
      ) : null}
      <small className="portal-muted">{score.aviso}</small>
    </>
  )
}

function CartaoAssinatura({ direito }: { direito: Direito }) {
  let situacao: string
  if (direito.plano === 'TRIAL') {
    situacao = direito.fimTrialEm ? `Teste até ${data.format(new Date(direito.fimTrialEm))}` : 'Teste ativo'
  } else if (direito.plano === 'PREMIUM') {
    situacao = direito.emCarencia
      ? `Pagamento pendente · acesso até ${direito.acessoAte ? data.format(new Date(direito.acessoAte)) : '—'}`
      : 'Ativa'
  } else {
    situacao = 'Sem acesso ao semáforo de bem-estar'
  }

  return (
    <p>
      <strong>{PLANOS[direito.plano]}</strong> · <span className="portal-muted">{situacao}</span>
    </p>
  )
}

function ListaAlertas({ alertas }: { alertas: Alerta[] }) {
  return (
    <ul className="portal-list">
      {alertas.slice(0, 5).map((alerta) => (
        <li key={alerta.id} className="portal-list__item">
          <div>
            <strong>{alerta.titulo}</strong>
            <small>{formatarDataHora(alerta.geradoEm)}</small>
          </div>
          {alerta.avaliacao ? (
            <span className="portal-muted">{alerta.avaliacao === 'UTIL' ? 'Marcado como útil' : 'Marcado como falso'}</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function rotuloTipoDado(tipo: string): string {
  const rotulos: Record<string, string> = {
    BATIMENTOS: 'batimentos',
    PASSOS: 'passos',
    SONO: 'sono',
    OXIGENACAO: 'oxigenação',
    LOCALIZACAO: 'localização',
  }
  return rotulos[tipo] ?? tipo.toLowerCase()
}

function erroScore(erro: unknown): string | null {
  if (erro instanceof ApiError && erro.status === 403) {
    return 'O semáforo de bem-estar faz parte do Premium (ou do período de teste).'
  }
  return null
}

type BlocoProps<T> = {
  titulo: string
  icone: IconName
  tom: 'green' | 'blue' | 'purple' | 'coral' | 'amber'
  query: UseQueryResult<T>
  children: (dado: T) => ReactNode
  vazio?: (dado: T) => boolean
  mensagemVazio?: string
  /** Mensagem própria para um erro conhecido (ex.: 403 do Premium); null usa a mensagem genérica. */
  erro?: (erro: unknown) => string | null
}

/** Cartão com os estados de carregando, vazio e erro de uma consulta. */
function Bloco<T>({ titulo, icone, tom, query, children, vazio, mensagemVazio, erro }: BlocoProps<T>) {
  let conteudo: ReactNode
  if (query.isLoading) {
    conteudo = (
      <p className="portal-muted" role="status">
        Carregando…
      </p>
    )
  } else if (query.isError) {
    const conhecido = erro?.(query.error)
    conteudo = conhecido ? (
      <p className="portal-muted">{conhecido}</p>
    ) : (
      <EstadoErro mensagem="Não foi possível carregar." onRetry={() => void query.refetch()} />
    )
  } else if (query.data === undefined) {
    conteudo = null
  } else if (vazio?.(query.data)) {
    conteudo = <p className="portal-muted">{mensagemVazio}</p>
  } else {
    conteudo = children(query.data)
  }

  return (
    <article className="portal-card">
      <div className="portal-card__title-row">
        <span className={`feature__icon feature__icon--${tom}`}>
          <Icon name={icone} size={22} />
        </span>
        <h2>{titulo}</h2>
      </div>
      {conteudo}
    </article>
  )
}

function EstadoErro({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <div className="portal-state" role="alert">
      <p className="portal-muted">{mensagem}</p>
      <button type="button" className="btn btn--ghost btn--small" onClick={onRetry}>
        Tentar de novo
      </button>
    </div>
  )
}
