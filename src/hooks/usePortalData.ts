import { useQuery } from '@tanstack/react-query'
import {
  fetchFamiliarElders,
  fetchFamiliarEntitlement,
  fetchFamiliarMedications,
  fetchFamiliarNetwork,
  fetchFamiliarScore,
  fetchFamiliarTelemetry,
  type CareElder,
  type CareNetworkMember,
  type CurrentTelemetry,
  type BillingEntitlement,
  type MedicationRoutine,
  type RiskScore,
} from '../services/portalService'

const QUERY_OPTIONS = {
  staleTime: 60_000,
  retry: 0,
} as const

export function useFamiliarOverview(
  familiarSub: string | undefined,
  elderId: string | undefined,
) {
  const elders = useQuery<CareElder[]>({
    queryKey: ['portal', 'familiar', 'elders', familiarSub],
    queryFn: () => fetchFamiliarElders(familiarSub as string),
    enabled: Boolean(familiarSub),
    ...QUERY_OPTIONS,
  })

  const selectedElderId =
    (elderId && elders.data?.some((elder) => elder.id === elderId) ? elderId : undefined) ??
    elders.data?.[0]?.id
  const selectedElder = elders.data?.find((elder) => elder.id === selectedElderId) ?? null
  const hasElder = Boolean(selectedElderId)

  const score = useQuery<RiskScore>({
    queryKey: ['portal', 'familiar', 'score', selectedElderId],
    queryFn: () => fetchFamiliarScore(selectedElderId as string),
    enabled: hasElder,
    ...QUERY_OPTIONS,
  })

  const telemetry = useQuery<CurrentTelemetry>({
    queryKey: ['portal', 'familiar', 'telemetry', selectedElderId],
    queryFn: () => fetchFamiliarTelemetry(selectedElderId as string),
    enabled: hasElder,
    ...QUERY_OPTIONS,
  })

  const careNetwork = useQuery<CareNetworkMember[]>({
    queryKey: ['portal', 'familiar', 'network', selectedElderId],
    queryFn: () => fetchFamiliarNetwork(selectedElderId as string),
    enabled: hasElder,
    ...QUERY_OPTIONS,
  })

  const medications = useQuery<MedicationRoutine[]>({
    queryKey: ['portal', 'familiar', 'medications', selectedElderId],
    queryFn: () => fetchFamiliarMedications(selectedElderId as string),
    enabled: hasElder,
    ...QUERY_OPTIONS,
  })

  const entitlement = useQuery<BillingEntitlement>({
    queryKey: ['portal', 'familiar', 'entitlement', familiarSub],
    queryFn: fetchFamiliarEntitlement,
    enabled: Boolean(familiarSub),
    ...QUERY_OPTIONS,
  })

  return {
    elders,
    selectedElder,
    selectedElderId,
    score,
    telemetry,
    careNetwork,
    medications,
    entitlement,
  }
}
