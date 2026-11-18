import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '../services/api'
import {
  intervaloDoPeriodo,
  montarPontosGrafico,
  obterHistoricoScore,
  obterSerie,
} from '../services/familiarApi'
import { TrendChart } from './TrendChart'
import { METRICA_BATIMENTOS, METRICA_PASSOS, METRICA_SCORE, type TrendPeriod } from './trendMetrics'

type GraficoEvolucaoProps = {
  idosoId: string
  titulo?: string
  subtitulo?: string
}

/**
 * Evolução de 7 e 30 dias de um idoso: série diária do telemetry e histórico do score do insight.
 * Sem acesso ao score (403), o gráfico segue só com passos e batimentos.
 */
export function GraficoEvolucao({
  idosoId,
  titulo = 'Evolução',
  subtitulo = 'Passos e batimentos por dia, a partir dos dados do relógio, e o score de bem-estar.',
}: GraficoEvolucaoProps) {
  const [periodo, setPeriodo] = useState<TrendPeriod>('7d')
  const { de, ate } = intervaloDoPeriodo(periodo)
  const serie = useQuery({
    queryKey: ['evolucao', idosoId, 'serie', de, ate],
    queryFn: () => obterSerie(idosoId, de, ate),
  })
  const historico = useQuery({
    queryKey: ['evolucao', idosoId, 'historico-score', de, ate],
    queryFn: () => obterHistoricoScore(idosoId, de, ate),
    retry: (falhas, erro) => !(erro instanceof ApiError && erro.status === 403) && falhas < 2,
  })

  const metricas = [METRICA_PASSOS, METRICA_BATIMENTOS, ...(historico.isSuccess ? [METRICA_SCORE] : [])]
  const pontos = montarPontosGrafico(de, ate, serie.data, historico.data)

  return (
    <TrendChart
      title={titulo}
      subtitle={subtitulo}
      data={pontos}
      metrics={metricas}
      period={periodo}
      onPeriodChange={setPeriodo}
      isLoading={serie.isLoading}
      isError={serie.isError}
      onRetry={() => void serie.refetch()}
    />
  )
}
