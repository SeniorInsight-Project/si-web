import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCsrfToken } from './api'
import { fetchBffSession, parseBffSession } from './authService'

function respondWith(status: number, body?: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchBffSession falha fechado', () => {
  it('falha de rede não autentica e não inventa token CSRF', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const session = await fetchBffSession()

    expect(session.authenticated).toBe(false)
    expect(session.user).toBeNull()
    expect(getCsrfToken()).toBeNull()
  })

  it.each([401, 403, 500, 502, 503])('HTTP %i não autentica', async (status) => {
    respondWith(status)

    const session = await fetchBffSession()

    expect(session.authenticated).toBe(false)
    expect(session.user).toBeNull()
  })

  it.each([
    [401, false],
    [403, false],
    [500, true],
    [503, true],
  ])('HTTP %i marca indisponível = %s', async (status, indisponivel) => {
    respondWith(status)

    expect(Boolean((await fetchBffSession()).unavailable)).toBe(indisponivel)
  })

  it('corpo que não é JSON não autentica', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>gateway</html>', { status: 200 })),
    )

    expect((await fetchBffSession()).authenticated).toBe(false)
  })

  it('sessão autenticada válida mantém só os papéis conhecidos', async () => {
    respondWith(200, {
      authenticated: true,
      user: { sub: 'abc', name: 'Ana', email: 'ana@exemplo.com', roles: ['familiar', 'ADMIN'] },
    })

    const session = await fetchBffSession()

    expect(session.authenticated).toBe(true)
    expect(session.user?.roles).toEqual(['FAMILIAR'])
  })
})

describe('parseBffSession', () => {
  it.each([
    ['nulo', null],
    ['texto', 'ok'],
    ['sem authenticated', { user: { sub: 'abc', roles: ['FAMILIAR'] } }],
    ['authenticated como texto', { authenticated: 'true', user: { sub: 'abc', roles: ['FAMILIAR'] } }],
    ['sem usuário', { authenticated: true, user: null }],
    ['sem sub', { authenticated: true, user: { roles: ['EQUIPE'] } }],
  ])('resposta inválida (%s) não autentica', (_, payload) => {
    const session = parseBffSession(payload)

    expect(session.authenticated).toBe(false)
    expect(session.user).toBeNull()
  })

  it('papéis ausentes resultam em lista vazia', () => {
    const session = parseBffSession({ authenticated: true, user: { sub: 'abc' } })

    expect(session.authenticated).toBe(true)
    expect(session.user?.roles).toEqual([])
  })
})
