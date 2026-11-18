import { describe, expect, it } from 'vitest'
import { normalizeGatewayBaseUrl } from './config'

describe('normalizeGatewayBaseUrl', () => {
  it('sem valor, exige a variável em vez de cair em localhost', () => {
    expect(() => normalizeGatewayBaseUrl(undefined)).toThrow(/VITE_API_BASE_URL/)
    expect(() => normalizeGatewayBaseUrl('  ')).toThrow(/VITE_API_BASE_URL/)
  })

  it('remove a barra final', () => {
    expect(normalizeGatewayBaseUrl('/api/')).toBe('/api')
  })
})
