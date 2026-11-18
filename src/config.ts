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

/**
 * Normaliza a URL do gateway. Sem valor, falha: no build de produção a ausência da
 * variável já é barrada pelo vite.config.ts, e só o servidor de desenvolvimento
 * recebe o gateway local como padrão (ver API_BASE_URL).
 */
export function normalizeGatewayBaseUrl(rawUrl?: string): string {
  const trimmed = rawUrl?.trim().replace(/\/+$/, '')
  if (!trimmed) {
    throw new Error('VITE_API_BASE_URL não está definida.')
  }

  return trimmed
}

export function isDirectServiceUrl(url: string): boolean {
  return KNOWN_DIRECT_SERVICE_PATTERNS.some((pattern) => pattern.test(url))
}

export const API_BASE_URL = normalizeGatewayBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:8080/api' : undefined),
)

export const GATEWAY_ORIGIN = API_BASE_URL.replace(/\/api(?:\/v\d+)?$/, '')
