import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderizar, responder, sessao } from '../test/utils'
import { ConvitePage } from './ConvitePage'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.sessionStorage.clear()
})

const CONVITE = {
  nomeConvidante: 'Rita Alves',
  primeiroNomeIdoso: 'Teresa',
  papelAcesso: 'MEDICO',
  expiraEm: '2026-11-20T18:30:00Z',
  status: 'PENDENTE',
}

describe('ConvitePage', () => {
  it('sem sessão guarda o token e manda ao login', () => {
    const contexto = sessao(null)
    renderizar(<ConvitePage />, contexto, '/?token=abc')

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(window.sessionStorage.getItem('si:convite-pendente')).toBe('abc')
    expect(contexto.loginWithKeycloak).toHaveBeenCalled()
  })

  it('mostra o convite e aceita com POST', async () => {
    window.sessionStorage.setItem('si:convite-pendente', 'abc')
    const fetchFalso = responder([
      [/\/v1\/identity\/me$/, 200, { id: 'p', tipo: 'FAMILIAR', nome: 'Ana', criadoEm: 'x', atualizadoEm: 'x' }],
      [/\/v1\/convites\/aceitar/, 200, { vinculoId: 'v', idosoId: 'i', familiarId: 'f', criadoEm: 'x' }, 'POST'],
      [/\/v1\/convites\?token=abc$/, 200, CONVITE],
    ])

    renderizar(<ConvitePage />, sessao(['FAMILIAR']), '/?token=abc')

    expect(await screen.findByText('Rita Alves')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }))

    expect(await screen.findByText(/saia e entre de novo/)).toBeTruthy()
    expect(fetchFalso.mock.calls.some(([url, init]) => String(url).includes('/convites/aceitar') && init?.method === 'POST')).toBe(true)
    expect(window.sessionStorage.getItem('si:convite-pendente')).toBeNull()
  })

  it('convite expirado explica o motivo', async () => {
    responder([
      [/\/v1\/identity\/me$/, 200, {}],
      [/\/v1\/convites\?token=velho$/, 410, undefined],
    ])

    renderizar(<ConvitePage />, sessao(['FAMILIAR']), '/?token=velho')

    expect(await screen.findByText(/expirou/)).toBeTruthy()
  })
})
