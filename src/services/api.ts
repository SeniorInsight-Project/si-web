import { API_BASE_URL } from '../config'

export type HealthResponse = {
  status: string
  [key: string]: unknown
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export async function fetchBackendHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health')
}
