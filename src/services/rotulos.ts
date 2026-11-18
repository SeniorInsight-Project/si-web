import type { ScoreRecente } from './familiarApi'

/** Faixas do semáforo do insight, com o tom usado nas pílulas. */
export const FAIXAS: Record<NonNullable<ScoreRecente['faixa']>, { label: string; tone: 'green' | 'amber' | 'coral' }> = {
  VERDE: { label: 'Verde', tone: 'green' },
  AMARELO: { label: 'Amarelo', tone: 'amber' },
  VERMELHO: { label: 'Vermelho', tone: 'coral' },
}
