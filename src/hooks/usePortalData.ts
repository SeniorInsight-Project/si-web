import { useQuery } from '@tanstack/react-query'
import {
  fetchEquipeOverview,
  fetchFamiliarOverview,
  fetchMedicoOverview,
  fetchOperadoraOverview,
  type EquipeOverview,
  type FamiliarOverview,
  type MedicoOverview,
  type OperadoraOverview,
  type TrendPeriod,
} from '../services/portalService'

export function useFamiliarOverview(period: TrendPeriod) {
  return useQuery<FamiliarOverview>({
    queryKey: ['portal', 'familiar', period],
    queryFn: () => fetchFamiliarOverview(period),
    staleTime: 60_000,
  })
}

export function useMedicoOverview(period: TrendPeriod) {
  return useQuery<MedicoOverview>({
    queryKey: ['portal', 'medico', period],
    queryFn: () => fetchMedicoOverview(period),
    staleTime: 60_000,
  })
}

export function useOperadoraOverview(period: TrendPeriod) {
  return useQuery<OperadoraOverview>({
    queryKey: ['portal', 'operadora', period],
    queryFn: () => fetchOperadoraOverview(period),
    staleTime: 60_000,
  })
}

export function useEquipeOverview(period: TrendPeriod) {
  return useQuery<EquipeOverview>({
    queryKey: ['portal', 'equipe', period],
    queryFn: () => fetchEquipeOverview(period),
    staleTime: 60_000,
  })
}
