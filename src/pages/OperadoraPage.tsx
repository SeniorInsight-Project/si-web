import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ChangeEvent } from 'react'
import { EstadoErro } from '../components/Bloco'
import { Icon } from '../components/Icon'
import { TrendChart } from '../components/TrendChart'
import type { TrendMetric, TrendPeriod } from '../components/trendMetrics'
import { ApiError } from '../services/api'
import {
  importarBeneficiarios,
  listarImportacoes,
  obterCoorte,
  obterImportacao,
  obterMinhaOperadora,
  obterResumo,
  obterSerieCarteira,
  percentual,
  type FaixaCarteira,
  type ImportacaoDetalhe,
  type MotivoErroLinha,
  type ResumoCarteira,
} from '../services/operadoraApi'

const FAIXAS: Record<FaixaCarteira, { label: string; tone: 'green' | 'amber' | 'coral' | 'blue' }> = {
  VERDE: { label: 'Verde', tone: 'green' },
  AMARELO: { label: 'Amarelo', tone: 'amber' },
  VERMELHO: { label: 'Vermelho', tone: 'coral' },
  SEM_SCORE: { label: 'Sem score', tone: 'blue' },
}

const MOTIVOS: Record<MotivoErroLinha, string> = {
  CPF_INVALIDO: 'CPF inválido',
  DATA_INVALIDA: 'Data de nascimento inválida (use AAAA-MM-DD)',
  CODIGO_AUSENTE: 'Código do beneficiário vazio',
  CODIGO_REPETIDO: 'Código ou pessoa repetidos no arquivo',
  IDOSO_NAO_ENCONTRADO: 'Pessoa não cadastrada no SeniorInsight',
  COLUNAS_INVALIDAS: 'Linha sem as três colunas',
}

const METRICAS_SERIE: TrendMetric[] = [
  { key: 'scoreMedio', label: 'Score médio', unit: 'pts', color: '#1e2e69' },
  { key: 'vermelho', label: 'Na faixa vermelha', unit: 'pessoas', color: '#d83729' },
  { key: 'total', label: 'Monitorados', unit: 'pessoas', color: '#10b981' },
]

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function OperadoraPage() {
  const operadora = useQuery({
    queryKey: ['operadora', 'eu'],
    queryFn: obterMinhaOperadora,
    retry: (falhas, erro) => !(erro instanceof ApiError && erro.status === 404) && falhas < 2,
  })

  if (operadora.isLoading) {
    return (
      <div className="portal-page">
        <p className="portal-muted" role="status">
          Carregando…
        </p>
      </div>
    )
  }

  if (operadora.isError || !operadora.data) {
    const semOperadora = operadora.error instanceof ApiError && operadora.error.status === 404
    return (
      <div className="portal-page">
        {semOperadora ? (
          <section className="portal-card portal-auth-gate">
            <h2>Conta ainda não ligada a uma operadora</h2>
            <p className="portal-muted">Fale com a equipe SeniorInsight para concluir o acesso da sua operadora.</p>
          </section>
        ) : (
          <EstadoErro mensagem="Não foi possível carregar a operadora." onRetry={() => void operadora.refetch()} />
        )}
      </div>
    )
  }

  const operadoraId = operadora.data.id

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área da Operadora</span>
          <h1>Carteira · {operadora.data.nome}</h1>
          <p className="portal-muted">
            Só entram beneficiários que autorizaram o compartilhamento com a operadora. Ninguém aparece pelo nome.
          </p>
        </div>
      </header>

      <Resumo operadoraId={operadoraId} />

      <section className="portal-grid portal-grid--2" aria-label="Coorte e importação">
        <Coorte operadoraId={operadoraId} />
        <Importacao operadoraId={operadoraId} />
      </section>

      <SerieCarteiraGrafico operadoraId={operadoraId} />
    </div>
  )
}

function Resumo({ operadoraId }: { operadoraId: string }) {
  const resumo = useQuery({ queryKey: ['operadora', operadoraId, 'resumo'], queryFn: () => obterResumo(operadoraId) })

  if (resumo.isLoading) {
    return (
      <p className="portal-muted" role="status">
        Carregando o resumo…
      </p>
    )
  }
  if (resumo.isError || !resumo.data) {
    return <EstadoErro mensagem="Não foi possível carregar o resumo." onRetry={() => void resumo.refetch()} />
  }
  return <CartoesResumo resumo={resumo.data} />
}

function CartoesResumo({ resumo }: { resumo: ResumoCarteira }) {
  const faixas: FaixaCarteira[] = ['VERDE', 'AMARELO', 'VERMELHO', 'SEM_SCORE']
  return (
    <section className="portal-grid portal-grid--4" aria-label="Indicadores da carteira">
      <div className="portal-stat-card">
        <span className="portal-muted">Monitorados</span>
        <strong>{resumo.total}</strong>
        <small>
          {resumo.atualizadoEm ? `Atualizado em ${dataHora.format(new Date(resumo.atualizadoEm))}` : 'Sem importação'}
        </small>
      </div>
      {faixas.map((faixa) => {
        const quantidade = resumo.porFaixa[faixa]
        const pct = percentual(quantidade, resumo.total)
        return (
          <div key={faixa} className={`portal-stat-card portal-stat-card--${FAIXAS[faixa].tone}`}>
            <span className="portal-muted">{FAIXAS[faixa].label}</span>
            <strong>{quantidade}</strong>
            <small>{pct ? `${pct} da carteira` : '—'}</small>
          </div>
        )
      })}
    </section>
  )
}

function Coorte({ operadoraId }: { operadoraId: string }) {
  const [pagina, setPagina] = useState(0)
  const [faixa, setFaixa] = useState<FaixaCarteira | ''>('')
  const coorte = useQuery({
    queryKey: ['operadora', operadoraId, 'coorte', pagina, faixa],
    queryFn: () => obterCoorte(operadoraId, pagina, faixa || undefined),
  })
  const totalPaginas = coorte.data ? Math.max(1, Math.ceil(coorte.data.total / coorte.data.tamanho)) : 1

  return (
    <article className="portal-card">
      <div className="portal-card__title-row">
        <h2>Coorte pseudonimizada</h2>
      </div>
      <label className="portal-select">
        <span className="portal-muted">Faixa</span>
        <select
          value={faixa}
          onChange={(e) => {
            setFaixa(e.target.value as FaixaCarteira | '')
            setPagina(0)
          }}
        >
          <option value="">Todas</option>
          {(Object.keys(FAIXAS) as FaixaCarteira[]).map((f) => (
            <option key={f} value={f}>
              {FAIXAS[f].label}
            </option>
          ))}
        </select>
      </label>
      {coorte.isLoading ? (
        <p className="portal-muted" role="status">
          Carregando…
        </p>
      ) : coorte.isError || !coorte.data ? (
        <EstadoErro mensagem="Não foi possível carregar a coorte." onRetry={() => void coorte.refetch()} />
      ) : coorte.data.itens.length === 0 ? (
        <p className="portal-muted">Ninguém nesta faixa.</p>
      ) : (
        <>
          <div className="portal-table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Faixa etária</th>
                  <th>Faixa / score</th>
                  <th>Calculado em</th>
                </tr>
              </thead>
              <tbody>
                {coorte.data.itens.map((item) => (
                  <tr key={item.codigo}>
                    <td>
                      <strong>{item.codigo}</strong>
                    </td>
                    <td>{item.faixaEtaria === 'ATE-59' ? 'Até 59' : item.faixaEtaria}</td>
                    <td>
                      <span className={`portal-band-pill portal-band-pill--${FAIXAS[item.faixa].tone}`}>
                        {FAIXAS[item.faixa].label}
                        {typeof item.score === 'number' ? ` (${Math.round(item.score)})` : ''}
                      </span>
                    </td>
                    <td>{item.calculadoEm ? dataHora.format(new Date(item.calculadoEm)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="portal-state">
            <button
              type="button"
              className="btn btn--ghost btn--small"
              disabled={pagina === 0}
              onClick={() => setPagina((p) => p - 1)}
            >
              Anterior
            </button>
            <span className="portal-muted">
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              disabled={pagina + 1 >= totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </article>
  )
}

function Importacao({ operadoraId }: { operadoraId: string }) {
  const queryClient = useQueryClient()
  const lotes = useQuery({
    queryKey: ['operadora', operadoraId, 'importacoes'],
    queryFn: () => listarImportacoes(operadoraId),
  })
  const [detalhe, setDetalhe] = useState<ImportacaoDetalhe | null>(null)
  const enviar = useMutation({
    mutationFn: (arquivo: File) => importarBeneficiarios(operadoraId, arquivo),
    onSuccess: (resultado) => {
      setDetalhe(resultado)
      void queryClient.invalidateQueries({ queryKey: ['operadora', operadoraId] })
    },
  })
  const abrirLote = useMutation({
    mutationFn: (id: string) => obterImportacao(operadoraId, id),
    onSuccess: setDetalhe,
  })

  const escolher = (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0]
    if (arquivo) {
      enviar.mutate(arquivo)
    }
    evento.target.value = ''
  }

  return (
    <article className="portal-card">
      <div className="portal-card__title-row">
        <span className="feature__icon feature__icon--purple">
          <Icon name="users" size={22} />
        </span>
        <h2>Importação de beneficiários</h2>
      </div>
      <p className="portal-muted">
        CSV com o cabeçalho <code>codigo_beneficiario,cpf,data_nascimento</code> (data em AAAA-MM-DD). O lote novo
        substitui a carteira: quem não vier nele sai.
      </p>
      <label className="btn btn--navy btn--small portal-upload">
        {enviar.isPending ? 'Enviando…' : 'Enviar arquivo CSV'}
        <input type="file" accept=".csv,text/csv" onChange={escolher} disabled={enviar.isPending} hidden />
      </label>
      {enviar.isError ? (
        <p className="portal-muted" role="alert">
          {enviar.error instanceof ApiError && enviar.error.status === 400
            ? 'O arquivo não está no formato esperado (cabeçalho, tamanho até 2 MB e até 5.000 linhas).'
            : 'Não foi possível enviar o arquivo. Tente de novo.'}
        </p>
      ) : null}

      {detalhe ? <DetalheLote detalhe={detalhe} /> : null}

      <h3>Lotes enviados</h3>
      {lotes.isLoading ? (
        <p className="portal-muted" role="status">
          Carregando…
        </p>
      ) : lotes.isError ? (
        <EstadoErro mensagem="Não foi possível carregar os lotes." onRetry={() => void lotes.refetch()} />
      ) : (lotes.data ?? []).length === 0 ? (
        <p className="portal-muted">Nenhum lote enviado ainda.</p>
      ) : (
        <ul className="portal-list">
          {(lotes.data ?? []).map((lote) => (
            <li key={lote.id} className="portal-list__item">
              <div>
                <strong>{lote.nomeArquivo}</strong>
                <small>
                  {dataHora.format(new Date(lote.criadoEm))} · {lote.importadas} de {lote.totalLinhas} importadas
                </small>
              </div>
              {lote.recusadas > 0 ? (
                <button type="button" className="btn btn--ghost btn--small" onClick={() => abrirLote.mutate(lote.id)}>
                  Ver {lote.recusadas} recusadas
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function DetalheLote({ detalhe }: { detalhe: ImportacaoDetalhe }) {
  return (
    <div className="portal-highlight-box" role="status">
      <strong>
        {detalhe.nomeArquivo}: {detalhe.importadas} importadas, {detalhe.recusadas} recusadas
      </strong>
      {detalhe.erros.length ? (
        <ul className="portal-bullets">
          {detalhe.erros.slice(0, 50).map((erro) => (
            <li key={erro.linha}>
              Linha {erro.linha}
              {erro.codigoBeneficiario ? ` (${erro.codigoBeneficiario})` : ''}: {MOTIVOS[erro.motivo]}
            </li>
          ))}
        </ul>
      ) : null}
      {detalhe.erros.length > 50 ? <small>E mais {detalhe.erros.length - 50} linhas.</small> : null}
    </div>
  )
}

function SerieCarteiraGrafico({ operadoraId }: { operadoraId: string }) {
  const [periodo, setPeriodo] = useState<TrendPeriod>('7d')
  const serie = useQuery({
    queryKey: ['operadora', operadoraId, 'serie', periodo],
    queryFn: () => obterSerieCarteira(operadoraId, periodo),
  })
  const pontos = (serie.data?.pontos ?? []).map((p) => ({
    label: `${p.dia.slice(8, 10)}/${p.dia.slice(5, 7)}`,
    scoreMedio: p.scoreMedio ?? null,
    vermelho: p.total ? p.porFaixa.VERMELHO : null,
    total: p.total,
  }))

  return (
    <TrendChart
      title="Evolução da carteira"
      subtitle="Por dia, com a carteira atual: score médio na última mudança de faixa de cada pessoa e contagem na faixa vermelha."
      data={pontos}
      metrics={METRICAS_SERIE}
      period={periodo}
      onPeriodChange={setPeriodo}
      isLoading={serie.isLoading}
      isError={serie.isError}
      onRetry={() => void serie.refetch()}
    />
  )
}

