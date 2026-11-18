import type { components as CareTypes } from '../contracts/care-v1'
import type { components as IdentityTypes } from '../contracts/identity-v1'
import type { components as ReportTypes } from '../contracts/report-v1'
import { apiRequest } from './api'

export type PerfilProfissional = IdentityTypes['schemas']['PerfilProfissional']
export type PerfilProfissionalRequest = IdentityTypes['schemas']['PerfilProfissionalRequest']
export type Perfil = IdentityTypes['schemas']['Perfil']
export type Relatorio = ReportTypes['schemas']['Relatorio']
export type LinkDownload = ReportTypes['schemas']['LinkDownload']
export type ConvitePublico = CareTypes['schemas']['ConvitePublico']
export type AceiteConvite = CareTypes['schemas']['AceiteConvite']

const enc = encodeURIComponent

/** Perfil do usuário no identity. No primeiro acesso cria o perfil de familiar, exigido para aceitar convites. */
export function obterMeuPerfil(): Promise<Perfil> {
  return apiRequest<Perfil>('/v1/identity/me')
}

export function obterPerfilProfissional(): Promise<PerfilProfissional> {
  return apiRequest<PerfilProfissional>('/v1/identity/me/perfil-profissional')
}

export function salvarPerfilProfissional(dados: PerfilProfissionalRequest): Promise<PerfilProfissional> {
  return apiRequest<PerfilProfissional>('/v1/identity/me/perfil-profissional', {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function listarRelatorios(idosoId: string): Promise<Relatorio[]> {
  return apiRequest<Relatorio[]>(`/v1/report/idosos/${enc(idosoId)}/relatorios`)
}

export function obterLinkRelatorio(relatorioId: string): Promise<LinkDownload> {
  return apiRequest<LinkDownload>(`/v1/report/relatorios/${enc(relatorioId)}/download`)
}

export function consultarConvite(token: string): Promise<ConvitePublico> {
  return apiRequest<ConvitePublico>(`/v1/convites?token=${enc(token)}`)
}

export function aceitarConvite(token: string): Promise<AceiteConvite> {
  return apiRequest<AceiteConvite>(`/v1/convites/aceitar?token=${enc(token)}`, { method: 'POST' })
}

const CHAVE_CONVITE = 'si:convite-pendente'

/** Guarda o token do convite enquanto o usuário vai ao login (o BFF sempre volta para /portal). */
export function guardarConvitePendente(token: string): void {
  try {
    window.sessionStorage.setItem(CHAVE_CONVITE, token)
  } catch {
    // Sem sessionStorage: o usuário abre o link do convite de novo depois de entrar.
  }
}

export function lerConvitePendente(): string | null {
  try {
    return window.sessionStorage.getItem(CHAVE_CONVITE)
  } catch {
    return null
  }
}

export function limparConvitePendente(): void {
  try {
    window.sessionStorage.removeItem(CHAVE_CONVITE)
  } catch {
    // nada a limpar
  }
}
