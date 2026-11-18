import type { components as CareTypes } from '../contracts/care-v1'
import type { components as ReportTypes } from '../contracts/report-v1'
import { apiRequest } from './api'

export type Operadora = CareTypes['schemas']['Operadora']
export type ImportacaoBeneficiarios = CareTypes['schemas']['ImportacaoBeneficiarios']
export type ImportacaoDetalhe = CareTypes['schemas']['ImportacaoBeneficiariosDetalhe']
export type MotivoErroLinha = CareTypes['schemas']['ErroLinhaImportacao']['motivo']
export type ResumoCarteira = ReportTypes['schemas']['ResumoCarteira']
export type PaginaCoorte = ReportTypes['schemas']['PaginaCoorte']
export type FaixaCarteira = ReportTypes['schemas']['FaixaCarteira']
export type SerieCarteira = ReportTypes['schemas']['SerieCarteira']

const enc = encodeURIComponent

export function obterMinhaOperadora(): Promise<Operadora> {
  return apiRequest<Operadora>('/v1/operadoras/eu')
}

export function obterResumo(operadoraId: string): Promise<ResumoCarteira> {
  return apiRequest<ResumoCarteira>(`/v1/report/operadoras/${enc(operadoraId)}/carteira/resumo`)
}

export function obterCoorte(
  operadoraId: string,
  pagina: number,
  faixa?: FaixaCarteira,
  tamanho = 20,
): Promise<PaginaCoorte> {
  const filtro = faixa ? `&faixa=${enc(faixa)}` : ''
  return apiRequest<PaginaCoorte>(
    `/v1/report/operadoras/${enc(operadoraId)}/carteira/coorte?pagina=${pagina}&tamanho=${tamanho}${filtro}`,
  )
}

export function obterSerieCarteira(operadoraId: string, periodo: '7d' | '30d'): Promise<SerieCarteira> {
  return apiRequest<SerieCarteira>(`/v1/report/operadoras/${enc(operadoraId)}/carteira/serie?periodo=${periodo}`)
}

export function listarImportacoes(operadoraId: string): Promise<ImportacaoBeneficiarios[]> {
  return apiRequest<ImportacaoBeneficiarios[]>(`/v1/operadoras/${enc(operadoraId)}/beneficiarios/importacoes`)
}

export function obterImportacao(operadoraId: string, importacaoId: string): Promise<ImportacaoDetalhe> {
  return apiRequest<ImportacaoDetalhe>(
    `/v1/operadoras/${enc(operadoraId)}/beneficiarios/importacoes/${enc(importacaoId)}`,
  )
}

export function importarBeneficiarios(operadoraId: string, arquivo: File): Promise<ImportacaoDetalhe> {
  const corpo = new FormData()
  corpo.append('arquivo', arquivo)
  return apiRequest<ImportacaoDetalhe>(`/v1/operadoras/${enc(operadoraId)}/beneficiarios/importacoes`, {
    method: 'POST',
    body: corpo,
  })
}

/** Percentual de uma parte no total, com uma casa decimal; null sem total. */
export function percentual(parte: number, total: number): string | null {
  if (total <= 0) {
    return null
  }
  return `${((parte / total) * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}
