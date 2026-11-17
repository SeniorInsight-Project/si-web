import type { components as BillingComponents } from '../contracts/billing-v1'
import type { components as CareComponents } from '../contracts/care-v1'
import type { components as InsightComponents } from '../contracts/insight-v1'
import type { components as TelemetryComponents } from '../contracts/telemetry-v1'
import { apiRequest } from './api'

export type TrendPeriod = '7d' | '30d'

export type TrendPoint = {
  label: string
  score: number
  heartRate: number
  steps: number
  sleepHours: number
}

export type CareElder = CareComponents['schemas']['Idoso']
export type CareNetworkMember = CareComponents['schemas']['MembroRede']
export type MedicationRoutine = CareComponents['schemas']['RotinaMedicamento']
export type RiskScore = InsightComponents['schemas']['ScoreRecente']
export type CurrentTelemetry = TelemetryComponents['schemas']['EstadoAtual']
export type BillingEntitlement = BillingComponents['schemas']['Direito']

export type FamiliarOverview = {
  elders: CareElder[]
  selectedElder: CareElder | null
  score: RiskScore | null
  telemetry: CurrentTelemetry | null
  careNetwork: CareNetworkMember[]
  medications: MedicationRoutine[]
  entitlement: BillingEntitlement | null
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value)
}

export function fetchFamiliarElders(familiarSub: string): Promise<CareElder[]> {
  return apiRequest<CareElder[]>(
    `/v1/familiares/${encodePathSegment(familiarSub)}/idosos`,
  )
}

export function fetchFamiliarScore(elderId: string): Promise<RiskScore> {
  return apiRequest<RiskScore>(
    `/v1/insight/idosos/${encodePathSegment(elderId)}/score-risco/recente`,
  )
}

export function fetchFamiliarTelemetry(elderId: string): Promise<CurrentTelemetry> {
  return apiRequest<CurrentTelemetry>(
    `/v1/telemetry/idosos/${encodePathSegment(elderId)}/hoje`,
  )
}

export function fetchFamiliarNetwork(elderId: string): Promise<CareNetworkMember[]> {
  return apiRequest<CareNetworkMember[]>(
    `/v1/idosos/${encodePathSegment(elderId)}/rede`,
  )
}

export function fetchFamiliarMedications(elderId: string): Promise<MedicationRoutine[]> {
  return apiRequest<MedicationRoutine[]>(
    `/v1/idosos/${encodePathSegment(elderId)}/rotinas-medicamentos`,
  )
}

export function fetchFamiliarEntitlement(): Promise<BillingEntitlement> {
  return apiRequest<BillingEntitlement>('/v1/billing/direito')
}

/**
 * Agrega os dados da área familiar para consumidores que precisem de uma leitura única.
 * A tela usa as funções individuais por bloco para manter loading, vazio e erro isolados.
 */
export async function fetchFamiliarOverview(
  familiarSub: string,
  elderId?: string,
): Promise<FamiliarOverview> {
  const elders = await fetchFamiliarElders(familiarSub)
  const selectedElder =
    elders.find((elder) => elder.id === elderId) ?? elders[0] ?? null

  if (!selectedElder) {
    return {
      elders,
      selectedElder: null,
      score: null,
      telemetry: null,
      careNetwork: [],
      medications: [],
      entitlement: await fetchFamiliarEntitlement(),
    }
  }

  const [score, telemetry, careNetwork, medications, entitlement] = await Promise.all([
    fetchFamiliarScore(selectedElder.id),
    fetchFamiliarTelemetry(selectedElder.id),
    fetchFamiliarNetwork(selectedElder.id),
    fetchFamiliarMedications(selectedElder.id),
    fetchFamiliarEntitlement(),
  ])

  return {
    elders,
    selectedElder,
    score,
    telemetry,
    careNetwork,
    medications,
    entitlement,
  }
}
