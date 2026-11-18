import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FamiliarPage } from './FamiliarPage'

type Rota = [RegExp, number, unknown]

function responder(rotas: Rota[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const rota = rotas.find(([padrao]) => padrao.test(url))
      if (!rota) {
        return Promise.resolve(new Response(null, { status: 404 }))
      }
      const [, status, corpo] = rota
      return Promise.resolve(
        new Response(corpo === undefined ? null : JSON.stringify(corpo), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }),
  )
}

function renderizar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <FamiliarPage />
    </QueryClientProvider>,
  )
}

const IDOSO = {
  id: '11111111-1111-4111-8111-111111111111',
  nomeCompleto: 'Teresa Nunes',
  dataNascimento: '1948-05-02',
  comorbidades: [],
  criadoEm: '2026-11-01T10:00:00Z',
  atualizadoEm: '2026-11-01T10:00:00Z',
  papelAcesso: 'ADMINISTRADOR',
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('FamiliarPage', () => {
  it('mostra os dados do backend, os status reais das doses e o aviso do Premium no 403', async () => {
    responder([
      [/\/v1\/idosos$/, 200, [IDOSO]],
      [/score-risco\/recente/, 403, undefined],
      [/score-risco\/historico/, 403, undefined],
      [/\/hoje$/, 200, { idosoId: IDOSO.id, passosHoje: 1520, metaPassos: 4000, frequenciaCardiaca: 77, coletadoEm: '2026-11-18T13:00:00Z' }],
      [/\/status$/, 200, { idosoId: IDOSO.id, ultimaSincronizacao: null, tiposAtivos: ['PASSOS'] }],
      [/rotinas-medicamentos/, 200, [
        { id: 'r1', idosoId: IDOSO.id, medicamentoNome: 'Remédio A', horario: '08:00', frequencia: 'DIARIA', ativo: true, statusHoje: 'ATRASADO' },
      ]],
      [/\/rede$/, 200, []],
      [/alertas/, 200, []],
      [/direito/, 200, { plano: 'FREE', acessoPremium: false, assinaturaAtiva: false, fimTrialEm: null, acessoAte: null, emCarencia: false, precoPremiumCentavos: null, moeda: 'BRL' }],
      [/serie/, 200, { idosoId: IDOSO.id, de: '2026-11-12', ate: '2026-11-18', series: [] }],
    ])

    renderizar()

    expect(await screen.findByRole('heading', { name: 'Teresa Nunes' })).toBeTruthy()
    expect(await screen.findByText('Atrasado')).toBeTruthy()
    expect(await screen.findByText(/faz parte do Premium/)).toBeTruthy()
    expect(await screen.findByText('Ninguém na rede ainda.')).toBeTruthy()
    expect(await screen.findByText('1.520 de 4.000')).toBeTruthy()
    expect(screen.queryByText(/sono/i)).toBeNull()
  })

  it('sem idosos mostra o estado vazio, sem dados inventados', async () => {
    responder([[/\/v1\/idosos$/, 200, []]])

    renderizar()

    expect(await screen.findByText('Nenhum idoso na sua rede')).toBeTruthy()
  })

  it('erro ao listar os idosos oferece nova tentativa', async () => {
    responder([[/\/v1\/idosos$/, 503, undefined]])

    renderizar()

    expect(await screen.findByRole('button', { name: 'Tentar de novo' })).toBeTruthy()
  })

  it('idoso em que o usuário é médico não aparece na área do familiar', async () => {
    responder([[/\/v1\/idosos$/, 200, [{ ...IDOSO, papelAcesso: 'MEDICO' }]]])

    renderizar()

    expect(await screen.findByText('Nenhum idoso na sua rede')).toBeTruthy()
  })
})
