import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { TrendMetric, TrendPeriod, TrendRow } from './trendMetrics'

export type { TrendMetric, TrendPeriod, TrendRow }

type TrendChartProps = {
  title: string
  subtitle: string
  data: TrendRow[]
  metrics: TrendMetric[]
  period: TrendPeriod
  onPeriodChange: (period: TrendPeriod) => void
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

export function TrendChart({
  title,
  subtitle,
  data,
  metrics,
  period,
  onPeriodChange,
  isLoading = false,
  isError = false,
  onRetry,
}: TrendChartProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const active = metrics.find((metric) => metric.key === selectedKey) ?? metrics[0]
  const fillId = `trendFill-${active?.key ?? 'vazio'}`
  const hasValues = Boolean(active) && data.some((row) => typeof row[active.key] === 'number')

  return (
    <section className="portal-card portal-chart" aria-label={title}>
      <div className="portal-chart__head">
        <div>
          <h3>{title}</h3>
          <p className="portal-muted">{subtitle}</p>
        </div>

        <div className="portal-chart__controls">
          <div className="portal-segmented" role="group" aria-label="Janela de tempo">
            <button
              type="button"
              className={`portal-segmented__btn ${period === '7d' ? 'is-active' : ''}`}
              aria-pressed={period === '7d'}
              onClick={() => onPeriodChange('7d')}
            >
              7 dias
            </button>
            <button
              type="button"
              className={`portal-segmented__btn ${period === '30d' ? 'is-active' : ''}`}
              aria-pressed={period === '30d'}
              onClick={() => onPeriodChange('30d')}
            >
              30 dias
            </button>
          </div>
        </div>
      </div>

      {metrics.length > 1 ? (
        <div className="portal-chart__metrics" role="tablist" aria-label="Indicador exibido">
          {metrics.map((metric) => {
            const isSelected = metric.key === active?.key
            return (
              <button
                key={metric.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`portal-metric-pill ${isSelected ? 'is-active' : ''}`}
                onClick={() => setSelectedKey(metric.key)}
              >
                <span className="portal-metric-pill__dot" style={{ backgroundColor: metric.color }} />
                {metric.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <div className="portal-chart__canvas">
        {isLoading ? (
          <p className="portal-muted" role="status">
            Carregando o histórico…
          </p>
        ) : isError ? (
          <div className="portal-state" role="alert">
            <p className="portal-muted">Não foi possível carregar o histórico.</p>
            {onRetry ? (
              <button type="button" className="btn btn--ghost btn--small" onClick={onRetry}>
                Tentar de novo
              </button>
            ) : null}
          </div>
        ) : !active || !hasValues ? (
          <p className="portal-muted">Ainda não há dados neste período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={active.color} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={active.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e8eb" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e6e8eb' }}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '14px',
                  border: '1px solid #e6e8eb',
                  boxShadow: '0 8px 20px rgba(30, 46, 105, 0.08)',
                }}
                formatter={(value) => [`${String(value)} ${active.unit}`, active.label]}
              />
              <Area
                type="monotone"
                dataKey={active.key}
                stroke={active.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${fillId})`}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
