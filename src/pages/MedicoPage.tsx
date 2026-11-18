import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Bloco, EstadoErro } from '../components/Bloco'
import { GraficoEvolucao } from '../components/GraficoEvolucao'
import { Icon } from '../components/Icon'
import { useSession } from '../hooks/useSession'
import { ApiError } from '../services/api'
import {
  idade,
  listarIdosos,
  obterScoreRecente,
  obterStatusAparelho,
  type Idoso,
} from '../services/familiarApi'
import {
  listarRelatorios,
  obterLinkRelatorio,
  obterPerfilProfissional,
  salvarPerfilProfissional,
  type PerfilProfissional,
  type Relatorio,
} from '../services/medicoApi'
import { FAIXAS } from '../services/rotulos'

const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function formatarData(valor?: string | null): string {
  return valor ? data.format(new Date(`${valor.length === 10 ? `${valor}T12:00:00` : valor}`)) : '—'
}

export function MedicoPage() {
  const { session } = useSession()
  const pacientes = useQuery({ queryKey: ['medico', 'pacientes'], queryFn: () => listarIdosos('MEDICO') })
  const [selecionado, setSelecionado] = useState<string | null>(null)

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <div>
          <span className="eyebrow">Área do Médico</span>
          <h1>Meus pacientes{session.user?.name ? ` · ${session.user.name}` : ''}</h1>
          <PerfilProfissionalResumo />
        </div>
        <span className="micro-pill micro-pill--blue">
          <Icon name="lock" size={14} /> Somente leitura
        </span>
      </header>

      <section className="portal-card" aria-label="Pacientes que autorizaram o acompanhamento">
        <h2>Pacientes</h2>
        <p className="portal-muted">
          Idosos cuja família convidou você para a rede de proteção. Os dados aparecem conforme o que cada idoso
          autorizou para o médico.
        </p>
        {pacientes.isLoading ? (
          <p className="portal-muted" role="status">
            Carregando…
          </p>
        ) : pacientes.isError ? (
          <EstadoErro mensagem="Não foi possível carregar os pacientes." onRetry={() => void pacientes.refetch()} />
        ) : (pacientes.data ?? []).length === 0 ? (
          <p className="portal-muted">
            Nenhum paciente ainda. O acompanhamento começa quando a família envia o convite e você aceita.
          </p>
        ) : (
          <div className="portal-table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Comorbidades</th>
                  <th>Semáforo</th>
                  <th>Última atualização</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {(pacientes.data ?? []).map((paciente) => (
                  <LinhaPaciente
                    key={paciente.id}
                    paciente={paciente}
                    ativo={paciente.id === selecionado}
                    onSelecionar={() => setSelecionado(paciente.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selecionado ? <DetalhePaciente idosoId={selecionado} /> : null}
    </div>
  )
}

function LinhaPaciente({
  paciente,
  ativo,
  onSelecionar,
}: {
  paciente: Idoso
  ativo: boolean
  onSelecionar: () => void
}) {
  const score = useQuery({ queryKey: ['medico', paciente.id, 'score'], queryFn: () => obterScoreRecente(paciente.id) })
  const status = useQuery({ queryKey: ['medico', paciente.id, 'status'], queryFn: () => obterStatusAparelho(paciente.id) })

  let semaforo = '—'
  let tom: 'green' | 'amber' | 'coral' | null = null
  if (score.isError) {
    semaforo = score.error instanceof ApiError && score.error.status === 403 ? 'Não autorizado' : 'Indisponível'
  } else if (score.data?.estado === 'DISPONIVEL' && score.data.faixa) {
    const faixa = FAIXAS[score.data.faixa]
    semaforo = `${faixa.label}${typeof score.data.score === 'number' ? ` (${Math.round(score.data.score)})` : ''}`
    tom = faixa.tone
  } else if (score.data) {
    semaforo = score.data.mensagem ?? 'Sem análise'
  }

  return (
    <tr className={ativo ? 'is-active' : undefined}>
      <td>
        <strong>{paciente.nomeCompleto}</strong>
        <small className="portal-table__sub">{idade(paciente.dataNascimento)} anos</small>
      </td>
      <td>{paciente.comorbidades.length ? paciente.comorbidades.join(' · ') : 'Nenhuma informada'}</td>
      <td>{tom ? <span className={`portal-band-pill portal-band-pill--${tom}`}>{semaforo}</span> : semaforo}</td>
      <td>
        {status.data?.ultimaSincronizacao
          ? dataHora.format(new Date(status.data.ultimaSincronizacao))
          : status.isError
            ? 'Indisponível'
            : '—'}
      </td>
      <td>
        <button type="button" className="btn btn--ghost btn--small" onClick={onSelecionar} aria-pressed={ativo}>
          Ver evolução
        </button>
      </td>
    </tr>
  )
}

function DetalhePaciente({ idosoId }: { idosoId: string }) {
  const relatorios = useQuery({ queryKey: ['medico', idosoId, 'relatorios'], queryFn: () => listarRelatorios(idosoId) })

  return (
    <>
      <Bloco
        titulo="Relatórios semanais"
        icone="clipboard"
        tom="blue"
        query={relatorios}
        vazio={(lista) => lista.length === 0}
        mensagemVazio="Nenhum relatório gerado ainda."
      >
        {(lista) => <ListaRelatorios relatorios={lista} />}
      </Bloco>
      <GraficoEvolucao
        idosoId={idosoId}
        titulo="Evolução do paciente"
        subtitulo="Passos e batimentos por dia e o score, conforme o que o paciente autorizou para o médico."
      />
    </>
  )
}

const STATUS_RELATORIO: Record<Relatorio['status'], string> = {
  PENDENTE: 'Na fila',
  GERANDO: 'Gerando',
  PRONTO: 'Pronto',
  FALHOU: 'Falhou',
}

function ListaRelatorios({ relatorios }: { relatorios: Relatorio[] }) {
  const [erro, setErro] = useState<string | null>(null)
  const baixar = useMutation({
    mutationFn: obterLinkRelatorio,
    onSuccess: (link) => {
      setErro(null)
      window.open(link.url, '_blank', 'noopener')
    },
    onError: () => setErro('Não foi possível gerar o link do PDF. Tente de novo.'),
  })

  return (
    <>
      <ul className="portal-list">
        {relatorios.map((relatorio) => (
          <li key={relatorio.id} className="portal-list__item">
            <div>
              <strong>
                {formatarData(relatorio.periodoInicio)} a {formatarData(relatorio.periodoFim)}
              </strong>
              <small>{STATUS_RELATORIO[relatorio.status]}</small>
            </div>
            {relatorio.status === 'PRONTO' ? (
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => baixar.mutate(relatorio.id)}
                disabled={baixar.isPending}
              >
                Baixar PDF
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {erro ? (
        <p className="portal-muted" role="alert">
          {erro}
        </p>
      ) : null}
    </>
  )
}

function PerfilProfissionalResumo() {
  const perfil = useQuery({
    queryKey: ['medico', 'perfil-profissional'],
    queryFn: obterPerfilProfissional,
    retry: (falhas, erro) => !(erro instanceof ApiError && erro.status === 404) && falhas < 2,
  })
  const [editando, setEditando] = useState(false)

  if (perfil.isLoading) {
    return null
  }
  const semPerfil = perfil.isError && perfil.error instanceof ApiError && perfil.error.status === 404
  if (perfil.isError && !semPerfil) {
    return <p className="portal-muted">Perfil profissional indisponível agora.</p>
  }
  if (semPerfil || editando) {
    return <FormPerfilProfissional atual={perfil.data} onSalvo={() => setEditando(false)} />
  }
  if (!perfil.data) {
    return null
  }
  return (
    <p className="portal-muted">
      {perfil.data.especialidade} · CRM {perfil.data.crmNumero}/{perfil.data.crmUf}{' '}
      <button type="button" className="btn btn--ghost btn--small" onClick={() => setEditando(true)}>
        Editar
      </button>
    </p>
  )
}

function FormPerfilProfissional({ atual, onSalvo }: { atual?: PerfilProfissional; onSalvo: () => void }) {
  const queryClient = useQueryClient()
  const [especialidade, setEspecialidade] = useState(atual?.especialidade ?? '')
  const [crmNumero, setCrmNumero] = useState(atual?.crmNumero ?? '')
  const [crmUf, setCrmUf] = useState(atual?.crmUf ?? '')
  const salvar = useMutation({
    mutationFn: salvarPerfilProfissional,
    onSuccess: (salvo) => {
      queryClient.setQueryData(['medico', 'perfil-profissional'], salvo)
      onSalvo()
    },
  })

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    salvar.mutate({ especialidade: especialidade.trim(), crmNumero: crmNumero.trim(), crmUf: crmUf.trim().toUpperCase() })
  }

  return (
    <form className="portal-form" onSubmit={enviar} aria-label="Perfil profissional">
      <p className="portal-muted">Informe sua especialidade e seu CRM.</p>
      <label>
        Especialidade
        <input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} required maxLength={100} />
      </label>
      <label>
        CRM (número)
        <input
          value={crmNumero}
          onChange={(e) => setCrmNumero(e.target.value)}
          required
          inputMode="numeric"
          pattern="[0-9]{1,10}"
        />
      </label>
      <label>
        UF
        <input value={crmUf} onChange={(e) => setCrmUf(e.target.value)} required maxLength={2} pattern="[A-Za-z]{2}" />
      </label>
      <button type="submit" className="btn btn--navy btn--small" disabled={salvar.isPending}>
        Salvar
      </button>
      {salvar.isError ? (
        <p className="portal-muted" role="alert">
          {salvar.error instanceof ApiError && salvar.error.status === 400
            ? 'Confira o CRM: só números e a UF com duas letras.'
            : 'Não foi possível salvar agora. Tente de novo.'}
        </p>
      ) : null}
    </form>
  )
}
