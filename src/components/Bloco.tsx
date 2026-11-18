import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export type BlocoProps<T> = {
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
export function Bloco<T>({ titulo, icone, tom, query, children, vazio, mensagemVazio, erro }: BlocoProps<T>) {
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

export function EstadoErro({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <div className="portal-state" role="alert">
      <p className="portal-muted">{mensagem}</p>
      <button type="button" className="btn btn--ghost btn--small" onClick={onRetry}>
        Tentar de novo
      </button>
    </div>
  )
}
