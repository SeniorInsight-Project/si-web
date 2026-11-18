import { describe, expect, it } from 'vitest'
import { idade, intervaloDoPeriodo, montarPontosGrafico } from './familiarApi'

describe('familiarApi', () => {
  it('idade conta anos completos', () => {
    expect(idade('1945-03-12', new Date(2026, 2, 11))).toBe(80)
    expect(idade('1945-03-12', new Date(2026, 2, 12))).toBe(81)
  })

  it('intervalo de 7 e 30 dias inclui hoje', () => {
    expect(intervaloDoPeriodo('7d', new Date(2026, 10, 18))).toEqual({ de: '2026-11-12', ate: '2026-11-18' })
    expect(intervaloDoPeriodo('30d', new Date(2026, 10, 18))).toEqual({ de: '2026-10-20', ate: '2026-11-18' })
  })

  it('gráfico tem um ponto por dia e deixa lacuna onde não há dado', () => {
    const pontos = montarPontosGrafico(
      '2026-11-16',
      '2026-11-18',
      {
        idosoId: 'x',
        de: '2026-11-16',
        ate: '2026-11-18',
        series: [
          { tipo: 'PASSOS', unidade: 'passos', autorizado: true, pontos: [{ dia: '2026-11-17', valor: 3200 }] },
          { tipo: 'BATIMENTOS', unidade: 'bpm', autorizado: false, pontos: [] },
        ],
      },
      {
        idosoId: 'x',
        de: '2026-11-16',
        ate: '2026-11-18',
        pontos: [{ score: 41, faixa: 'AMARELO', calculadoEm: '2026-11-18T15:00:00Z' }],
      },
    )

    expect(pontos.map((p) => p.label)).toEqual(['16/11', '17/11', '18/11'])
    expect(pontos.map((p) => p.passos)).toEqual([null, 3200, null])
    expect(pontos.every((p) => p.batimentos === null)).toBe(true)
    expect(pontos[2].score).toBe(41)
  })
})
