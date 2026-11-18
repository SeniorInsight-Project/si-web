import type { components as BillingTypes } from '../contracts/billing-v1'
import type { components as CareTypes } from '../contracts/care-v1'
import type { components as InsightTypes } from '../contracts/insight-v1'
import type { components as NotificationTypes } from '../contracts/notification-v1'
import type { components as TelemetryTypes } from '../contracts/telemetry-v1'
import { apiRequest } from './api'

/*
 * Rotas do gateway usadas pela visão Familiar (si-contracts). O API_BASE_URL já termina em /api:
 * o care fica em /v1/..., os outros serviços em /v1/<serviço>/...
 */

export type Idoso = CareTypes['schemas']['Idoso']
export type MembroRede = CareTypes['schemas']['MembroRede']
export type PapelAcesso = CareTypes['schemas']['PapelAcesso']
export type RotinaMedicamento = CareTypes['schemas']['RotinaMedicamento']
export type StatusIngestao = CareTypes['schemas']['StatusIngestao']
export type ScoreRecente = InsightTypes['schemas']['ScoreRecente']
export type HistoricoScore = InsightTypes['schemas']['HistoricoScore']
export type EstadoAtual = TelemetryTypes['schemas']['EstadoAtual']
export type StatusAparelho = TelemetryTypes['schemas']['StatusAparelho']
export type SerieDiaria = TelemetryTypes['schemas']['SerieDiaria']
export type Direito = BillingTypes['schemas']['Direito']
export type Alerta = NotificationTypes['schemas']['Alerta']

export type Periodo = '7d' | '30d'

const enc = encodeURIComponent

export function listarIdosos(papel?: PapelAcesso): Promise<Idoso[]> {
  return apiRequest<Idoso[]>(papel ? `/v1/idosos?papel=${enc(papel)}` : '/v1/idosos')
}

export function obterScoreRecente(idosoId: string): Promise<ScoreRecente> {
  return apiRequest<ScoreRecente>(`/v1/insight/idosos/${enc(idosoId)}/score-risco/recente`)
}

export function obterEstadoAtual(idosoId: string): Promise<EstadoAtual> {
  return apiRequest<EstadoAtual>(`/v1/telemetry/idosos/${enc(idosoId)}/hoje`)
}

export function obterStatusAparelho(idosoId: string): Promise<StatusAparelho> {
  return apiRequest<StatusAparelho>(`/v1/telemetry/idosos/${enc(idosoId)}/status`)
}

export function listarRotinasDoDia(idosoId: string, dia: string): Promise<RotinaMedicamento[]> {
  return apiRequest<RotinaMedicamento[]>(
    `/v1/idosos/${enc(idosoId)}/rotinas-medicamentos?data=${enc(dia)}`,
  )
}

export function listarRede(idosoId: string): Promise<MembroRede[]> {
  return apiRequest<MembroRede[]>(`/v1/idosos/${enc(idosoId)}/rede`)
}

export function obterDireito(): Promise<Direito> {
  return apiRequest<Direito>('/v1/billing/direito')
}

export function listarAlertas(idosoId: string): Promise<Alerta[]> {
  return apiRequest<Alerta[]>(`/v1/notification/idosos/${enc(idosoId)}/alertas`)
}

export function obterSerie(idosoId: string, de: string, ate: string): Promise<SerieDiaria> {
  return apiRequest<SerieDiaria>(
    `/v1/telemetry/idosos/${enc(idosoId)}/serie?de=${enc(de)}&ate=${enc(ate)}&tipo=PASSOS,BATIMENTOS`,
  )
}

export function obterHistoricoScore(idosoId: string, de: string, ate: string): Promise<HistoricoScore> {
  return apiRequest<HistoricoScore>(
    `/v1/insight/idosos/${enc(idosoId)}/score-risco/historico?de=${enc(de)}&ate=${enc(ate)}`,
  )
}

/** Data local no formato AAAA-MM-DD. */
export function diaLocal(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** Intervalo do período até hoje, inclusive. */
export function intervaloDoPeriodo(periodo: Periodo, hoje = new Date()): { de: string; ate: string } {
  const inicio = new Date(hoje)
  inicio.setDate(inicio.getDate() - (periodo === '7d' ? 6 : 29))
  return { de: diaLocal(inicio), ate: diaLocal(hoje) }
}

/** Idade em anos completos na data de referência. */
export function idade(dataNascimento: string, referencia = new Date()): number {
  const [ano, mes, dia] = dataNascimento.split('-').map(Number)
  let anos = referencia.getFullYear() - ano
  const mesAtual = referencia.getMonth() + 1
  if (mesAtual < mes || (mesAtual === mes && referencia.getDate() < dia)) {
    anos -= 1
  }
  return anos
}

/** Ponto do gráfico: um dia, com as métricas que existirem. */
export type PontoGrafico = {
  dia: string
  label: string
  passos: number | null
  batimentos: number | null
  score: number | null
}

/**
 * Junta a série diária do telemetry com o histórico do score (último cálculo de cada dia). Dias sem
 * dado ficam com null, e o gráfico mostra a lacuna em vez de inventar valor.
 */
export function montarPontosGrafico(
  de: string,
  ate: string,
  serie?: SerieDiaria,
  historico?: HistoricoScore,
): PontoGrafico[] {
  const passos = new Map<string, number | null>()
  const batimentos = new Map<string, number | null>()
  for (const s of serie?.series ?? []) {
    const alvo = s.tipo === 'PASSOS' ? passos : batimentos
    for (const ponto of s.pontos) {
      alvo.set(ponto.dia, ponto.valor ?? null)
    }
  }

  const score = new Map<string, number>()
  for (const ponto of historico?.pontos ?? []) {
    score.set(diaLocal(new Date(ponto.calculadoEm)), ponto.score)
  }

  const pontos: PontoGrafico[] = []
  const atual = new Date(`${de}T12:00:00`)
  const fim = new Date(`${ate}T12:00:00`)
  while (atual <= fim) {
    const dia = diaLocal(atual)
    pontos.push({
      dia,
      label: `${dia.slice(8, 10)}/${dia.slice(5, 7)}`,
      passos: passos.get(dia) ?? null,
      batimentos: batimentos.get(dia) ?? null,
      score: score.get(dia) ?? null,
    })
    atual.setDate(atual.getDate() + 1)
  }
  return pontos
}
