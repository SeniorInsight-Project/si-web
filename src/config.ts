const GATEWAY_DEFAULT_BASE_URL = 'http://localhost:8080/api'

const KNOWN_DIRECT_SERVICE_PATTERNS = [
  /si-care-service/i,
  /si-identity-service/i,
  /si-telemetry-service/i,
  /si-insight-service/i,
  /si-notification-service/i,
  /si-report-service/i,
  /si-billing-service/i,
  /:808[1-9]\b/,
]

export function normalizeGatewayBaseUrl(rawUrl?: string): string {
  const trimmed = rawUrl?.trim().replace(/\/+$/, '')
  if (!trimmed) {
    return GATEWAY_DEFAULT_BASE_URL
  }

  return trimmed
}

export function isDirectServiceUrl(url: string): boolean {
  return KNOWN_DIRECT_SERVICE_PATTERNS.some((pattern) => pattern.test(url))
}

export const API_BASE_URL = normalizeGatewayBaseUrl(
  import.meta.env.VITE_API_BASE_URL,
)

export const GATEWAY_ORIGIN = API_BASE_URL.replace(/\/api(?:\/v\d+)?$/, '')
