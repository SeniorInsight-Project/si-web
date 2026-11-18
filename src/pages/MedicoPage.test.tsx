import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderizar, responder, sessao } from '../test/utils'
import { MedicoPage } from './MedicoPage'

const PACIENTE = {
  id: '22222222-2222-4222-8222-222222222222',
  nomeCompleto: 'José Pereira',
  dataNascimento: '1944-01-20',
  comorbidades: ['Hipertensão'],
  criadoEm: '2026-11-01T10:00:00Z',
  atualizadoEm: '2026-11-01T10:00:00Z',
  papelAcesso: 'MEDICO',
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('MedicoPage', () => {
  it('lista os pacientes do backend com semáforo e sem selo de PDF assinado', async () => {
    const fetchFalso = responder([
      [/perfil-profissional/, 200, { especialidade: 'Geriatria', crmNumero: '12345', crmUf: 'DF', atualizadoEm: '2026-11-18T10:00:00Z' }],
      [/\/v1\/idosos\?papel=MEDICO$/, 200, [PACIENTE]],
      [/score-risco\/recente/, 200, { idosoId: PACIENTE.id, estado: 'DISPONIVEL', score: 62.4, faixa: 'AMARELO', diasComDadosValidos: 10, fatores: [], aviso: 'x' }],
      [/\/status$/, 200, { idosoId: PACIENTE.id, ultimaSincronizacao: null, tiposAtivos: [] }],
      [/relatorios$/, 200, [{ id: 'r1', idosoId: PACIENTE.id, tipo: 'SEMANAL_MEDICO', periodoInicio: '2026-11-09', periodoFim: '2026-11-15', status: 'PRONTO', geradoEm: '2026-11-16T08:00:00Z' }]],
      [/serie/, 200, { idosoId: PACIENTE.id, de: '2026-11-12', ate: '2026-11-18', series: [] }],
      [/historico/, 403, undefined],
    ])

    renderizar(<MedicoPage />, sessao(['MEDICO']))

    expect(await screen.findByText('José Pereira')).toBeTruthy()
    expect(await screen.findByText('Amarelo (62)')).toBeTruthy()
    expect(await screen.findByText(/CRM 12345\/DF/)).toBeTruthy()
    expect(screen.queryByText(/assinado/i)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Ver evolução' }))
    expect(await screen.findByRole('button', { name: 'Baixar PDF' })).toBeTruthy()
    expect(fetchFalso.mock.calls.some(([url]) => String(url).includes('/v1/report/idosos/'))).toBe(true)
  })

  it('sem perfil profissional mostra o formulário', async () => {
    responder([
      [/perfil-profissional/, 404, undefined],
      [/\/v1\/idosos\?papel=MEDICO$/, 200, []],
    ])

    renderizar(<MedicoPage />, sessao(['MEDICO']))

    expect(await screen.findByRole('form', { name: 'Perfil profissional' })).toBeTruthy()
    expect(await screen.findByText(/Nenhum paciente ainda/)).toBeTruthy()
  })
})
