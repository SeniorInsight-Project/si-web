import { useQuery } from '@tanstack/react-query'
import { fetchBackendHealth, type HealthResponse } from '../services/api'

export function useBackendHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['backend-health'],
    queryFn: fetchBackendHealth,
    retry: 1,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
