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
import type { TrendPeriod, TrendPoint } from '../services/portalService'

type MetricKey = 'score' | 'heartRate' | 'steps' | 'sleepHours'

const METRICS: {
  key: MetricKey
  label: string
  unit: string
  color: string
  fillId: string
}[] = [
  {
    key: 'score',
    label: 'Score de Risco (IA)',
    unit: 'pts',
    color: '#1e2e69',
    fillId: 'trendGradientNavy',
  },
  {
    key: 'heartRate',
    label: 'Frequência cardíaca',
    unit: 'bpm',
    color: '#d83729',
    fillId: 'trendGradientCoral',
  },
  {
    key: 'steps',
    label: 'Passos diários',
    unit: 'passos',
    color: '#10b981',
    fillId: 'trendGradientGreen',
  },
  {
    key: 'sleepHours',
    label: 'Horas de sono',
    unit: 'h',
    color: '#6d4fd8',
    fillId: 'trendGradientPurple',
  },
]

type TrendChartProps = {
  title: string
  subtitle: string
  data: TrendPoint[]
  period: TrendPeriod
  onPeriodChange: (period: TrendPeriod) => void
  defaultMetric?: MetricKey
}

export function TrendChart({
  title,
  subtitle,
  data,
  period,
  onPeriodChange,
  defaultMetric = 'score',
}: TrendChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(defaultMetric)
  const activeConfig =
    METRICS.find((metric) => metric.key === selectedMetric) ?? METRICS[0]

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

      <div className="portal-chart__metrics" role="tablist" aria-label="Indicador exibido">
        {METRICS.map((metric) => {
          const isSelected = metric.key === selectedMetric
          return (
            <button
              key={metric.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`portal-metric-pill ${isSelected ? 'is-active' : ''}`}
              onClick={() => setSelectedMetric(metric.key)}
            >
              <span
                className="portal-metric-pill__dot"
                style={{ backgroundColor: metric.color }}
              />
              {metric.label}
            </button>
          )
        })}
      </div>

      <div className="portal-chart__canvas">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 12, right: 16, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={activeConfig.fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e8eb" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e6e8eb' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '14px',
                border: '1px solid #e6e8eb',
                boxShadow: '0 8px 20px rgba(30, 46, 105, 0.08)',
              }}
              formatter={(value) => [`${String(value)} ${activeConfig.unit}`, activeConfig.label]}
            />
            <Area
              type="monotone"
              dataKey={activeConfig.key}
              stroke={activeConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${activeConfig.fillId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
