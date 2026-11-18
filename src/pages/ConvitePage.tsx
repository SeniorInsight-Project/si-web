import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EstadoErro } from '../components/Bloco'
import { useSession } from '../hooks/useSession'
import { ApiError } from '../services/api'
import type { PapelAcesso } from '../services/familiarApi'
import {
  aceitarConvite,
  consultarConvite,
  guardarConvitePendente,
  lerConvitePendente,
  limparConvitePendente,
  obterMeuPerfil,
} from '../services/medicoApi'

const PAPEIS: Record<PapelAcesso, string> = {
  ADMINISTRADOR: 'administrador',
  CUIDADOR: 'cuidador',
  OBSERVADOR: 'observador',
  MEDICO: 'médico',
}

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

/**
 * Aceite do convite para a rede de proteção (HU-016/017, si-web#10), aberto pelo link do e-mail:
 * /portal/convite?token=... Sem sessão, guarda o token e manda ao login; o BFF volta para /portal, que
 * traz o usuário de volta para cá.
 */
export function ConvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? lerConvitePendente()
  const { isAuthenticated, isLoading, loginWithKeycloak } = useSession()

  if (!token) {
    return (
      <section className="portal-card portal-auth-gate">
        <h2>Convite não encontrado</h2>
        <p className="portal-muted">Abra de novo o link que chegou no seu e-mail.</p>
      </section>
    )
  }

  if (isLoading) {
    return (
      <p className="portal-muted" role="status">
        Verificando sua sessão…
      </p>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="portal-card portal-auth-gate" aria-label="Entrar para aceitar o convite">
        <h2>Você recebeu um convite</h2>
        <p className="portal-muted">Entre com a sua conta SeniorInsight (ou crie uma) para ver e aceitar o convite.</p>
        <div className="portal-auth-gate__actions">
          <button
            type="button"
            className="btn btn--navy btn--small"
            onClick={() => {
              guardarConvitePendente(token)
              loginWithKeycloak()
            }}
          >
            Entrar
          </button>
        </div>
      </section>
    )
  }

  return <ConviteAutenticado token={token} />
}

function ConviteAutenticado({ token }: { token: string }) {
  // Garante o perfil no identity: no primeiro acesso ele é criado e o care recebe o familiar.
  const perfil = useQuery({ queryKey: ['convite', 'perfil'], queryFn: obterMeuPerfil, retry: 1 })
  const convite = useQuery({ queryKey: ['convite', token], queryFn: () => consultarConvite(token), retry: false })
  const aceitar = useMutation({ mutationFn: () => aceitarConvite(token), onSuccess: limparConvitePendente })

  useEffect(() => {
    if (convite.isError) {
      limparConvitePendente()
    }
  }, [convite.isError])

  if (convite.isLoading) {
    return (
      <p className="portal-muted" role="status">
        Carregando o convite…
      </p>
    )
  }

  if (convite.isError || !convite.data) {
    const status = convite.error instanceof ApiError ? convite.error.status : 0
    const mensagem =
      status === 404
        ? 'Este convite não existe.'
        : status === 409
          ? 'Este convite já foi aceito.'
          : status === 410
            ? 'Este convite expirou. Peça um novo à família.'
            : null
    return mensagem ? (
      <section className="portal-card portal-auth-gate">
        <h2>Convite indisponível</h2>
        <p className="portal-muted">{mensagem}</p>
        <Link to="/portal" className="btn btn--ghost btn--small">
          Ir para o portal
        </Link>
      </section>
    ) : (
      <EstadoErro mensagem="Não foi possível carregar o convite." onRetry={() => void convite.refetch()} />
    )
  }

  const dados = convite.data
  const papel = PAPEIS[dados.papelAcesso]

  if (aceitar.isSuccess) {
    return (
      <section className="portal-card portal-auth-gate" aria-label="Convite aceito">
        <h2>Convite aceito</h2>
        <p className="portal-muted">
          Você agora faz parte da rede de proteção de {dados.primeiroNomeIdoso} como {papel}.
          {dados.papelAcesso === 'MEDICO'
            ? ' Para a Área do Médico aparecer, saia e entre de novo no portal.'
            : ''}
        </p>
        <Link to="/portal" className="btn btn--navy btn--small">
          Ir para o portal
        </Link>
      </section>
    )
  }

  const erroAceite = aceitar.error instanceof ApiError ? aceitar.error.status : null

  return (
    <section className="portal-card portal-auth-gate" aria-label="Convite para a rede de proteção">
      <h2>Convite para a rede de proteção</h2>
      <p>
        <strong>{dados.nomeConvidante}</strong> convidou você para acompanhar <strong>{dados.primeiroNomeIdoso}</strong>{' '}
        como {papel}
        {dados.grauParentesco ? ` (${dados.grauParentesco})` : ''}.
      </p>
      <p className="portal-muted">Válido até {dataHora.format(new Date(dados.expiraEm))}.</p>
      <div className="portal-auth-gate__actions">
        <button
          type="button"
          className="btn btn--navy btn--small"
          onClick={() => aceitar.mutate()}
          disabled={aceitar.isPending || perfil.isLoading}
        >
          {aceitar.isPending ? 'Aceitando…' : 'Aceitar convite'}
        </button>
      </div>
      {aceitar.isError ? (
        <p className="portal-muted" role="alert">
          {erroAceite === 403
            ? 'Sua conta ainda está sendo preparada. Tente de novo em alguns segundos.'
            : erroAceite === 409
              ? 'Você já faz parte da rede deste idoso.'
              : erroAceite === 410
                ? 'Este convite expirou. Peça um novo à família.'
                : 'Não foi possível aceitar agora. Tente de novo.'}
        </p>
      ) : null}
    </section>
  )
}
