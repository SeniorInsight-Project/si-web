import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderizar, responder, sessao } from '../test/utils'
import { OperadoraPage } from './OperadoraPage'

const OP = '33333333-3333-4333-8333-333333333333'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('OperadoraPage', () => {
  it('calcula os percentuais a partir das contagens e mostra a coorte sem nomes', async () => {
    responder([
      [/\/v1\/operadoras\/eu$/, 200, { id: OP, nome: 'Operadora Exemplo', cnpj: '11222333000181', criadoEm: 'x' }],
      [/carteira\/resumo/, 200, { operadoraId: OP, total: 8, porFaixa: { VERDE: 6, AMARELO: 1, VERMELHO: 1, SEM_SCORE: 0 }, atualizadoEm: null }],
      [/carteira\/coorte/, 200, { itens: [{ codigo: 'BEN-7Q2K9F', faixaEtaria: '70-79', faixa: 'VERMELHO', score: 81.2, calculadoEm: null }], pagina: 0, tamanho: 20, total: 1 }],
      [/beneficiarios\/importacoes$/, 200, []],
      [/carteira\/serie/, 200, { operadoraId: OP, periodo: '7d', pontos: [] }],
    ])

    renderizar(<OperadoraPage />, sessao(['OPERADORA']))

    expect(await screen.findByText('Carteira · Operadora Exemplo')).toBeTruthy()
    expect(await screen.findByText('75,0% da carteira')).toBeTruthy()
    expect(screen.getAllByText('12,5% da carteira')).toHaveLength(2)
    expect(await screen.findByText('BEN-7Q2K9F')).toBeTruthy()
    expect(screen.queryByText(/Faturamento/)).toBeNull()
  })

  it('envia o CSV e mostra as linhas recusadas com o motivo', async () => {
    const fetchFalso = responder([
      [/\/v1\/operadoras\/eu$/, 200, { id: OP, nome: 'Op', cnpj: '1', criadoEm: 'x' }],
      [/carteira\/resumo/, 200, { operadoraId: OP, total: 0, porFaixa: { VERDE: 0, AMARELO: 0, VERMELHO: 0, SEM_SCORE: 0 } }],
      [/carteira\/coorte/, 200, { itens: [], pagina: 0, tamanho: 20, total: 0 }],
      [/beneficiarios\/importacoes$/, 201, {
        id: 'l1', operadoraId: OP, nomeArquivo: 'carteira.csv', totalLinhas: 2, importadas: 1, recusadas: 1, criadoEm: '2026-11-18T10:00:00Z',
        erros: [{ linha: 3, codigoBeneficiario: 'A-2', motivo: 'CPF_INVALIDO' }],
      }, 'POST'],
      [/beneficiarios\/importacoes$/, 200, []],
      [/carteira\/serie/, 200, { operadoraId: OP, periodo: '7d', pontos: [] }],
    ])

    const { container } = renderizar(<OperadoraPage />, sessao(['OPERADORA']))
    await screen.findByText('Nenhum lote enviado ainda.')
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['codigo_beneficiario,cpf,data_nascimento\n'], 'carteira.csv')] } })

    expect(await screen.findByText(/Linha 3 \(A-2\): CPF inválido/)).toBeTruthy()
    const envio = fetchFalso.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(envio?.[1]?.body).toBeInstanceOf(FormData)
  })

  it('conta sem operadora explica o próximo passo', async () => {
    responder([[/\/v1\/operadoras\/eu$/, 404, undefined]])

    renderizar(<OperadoraPage />, sessao(['OPERADORA']))

    expect(await screen.findByText('Conta ainda não ligada a uma operadora')).toBeTruthy()
  })
})
