import { useQuery } from '@tanstack/react-query'
import {
  fetchOperadoraOverview,
  type OperadoraOverview,
  type TrendPeriod,
} from '../services/portalService'

export function useOperadoraOverview(period: TrendPeriod) {
  return useQuery<OperadoraOverview>({
    queryKey: ['portal', 'operadora', period],
    queryFn: () => fetchOperadoraOverview(period),
    staleTime: 60_000,
  })
}
