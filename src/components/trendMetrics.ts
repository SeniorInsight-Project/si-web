export type TrendPeriod = '7d' | '30d'

export type TrendMetric = {
  key: string
  label: string
  unit: string
  color: string
}

export type TrendRow = { label: string } & Record<string, string | number | null>

/** Métricas comuns às visões. Cada visão passa só as que tem dado de verdade. */
export const METRICA_SCORE: TrendMetric = {
  key: 'score',
  label: 'Score de risco',
  unit: 'pts',
  color: '#1e2e69',
}
export const METRICA_BATIMENTOS: TrendMetric = {
  key: 'batimentos',
  label: 'Batimentos (média do dia)',
  unit: 'bpm',
  color: '#d83729',
}
export const METRICA_PASSOS: TrendMetric = {
  key: 'passos',
  label: 'Passos do dia',
  unit: 'passos',
  color: '#10b981',
}
