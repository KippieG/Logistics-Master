import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { KPI } from '../../types/warehouse'

interface Props { kpi: KPI }

const statusColor: Record<string, string> = {
  critical: 'border-red-800 bg-red-950/30',
  warning:  'border-amber-800 bg-amber-950/20',
  info:     'border-blue-800 bg-blue-950/20',
  good:     'border-emerald-800 bg-emerald-950/20',
}
const valueColor: Record<string, string> = {
  critical: 'text-red-400',
  warning:  'text-amber-400',
  info:     'text-blue-400',
  good:     'text-emerald-400',
}

export function StatCard({ kpi }: Props) {
  const trend = kpi.trend
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-gray-500'

  return (
    <div className={clsx(
      'rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:scale-[1.01]',
      statusColor[kpi.status]
    )}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-400">{kpi.label}</p>
        <span className={clsx('flex items-center gap-1 text-xs font-medium', trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className={clsx('text-3xl font-bold tabular-nums', valueColor[kpi.status])}>
          {typeof kpi.value === 'number' && kpi.value < 10 ? kpi.value.toFixed(2) : kpi.value.toLocaleString()}
        </span>
        <span className="text-gray-500 text-sm mb-1">{kpi.unit}</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{kpi.description}</p>
    </div>
  )
}
