import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { StatCard } from '../components/shared/StatCard'
import { WarehouseMap } from '../components/shared/WarehouseMap'
import { SeverityBadge } from '../components/shared/SeverityBadge'
import { useWarehouseStore } from '../store/warehouseStore'
import { buildKPIs, buildThroughputChart } from '../engine/calculations'
import { detectBottlenecks } from '../engine/bottleneck'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { config } = useWarehouseStore()
  const kpis = useMemo(() => buildKPIs(config), [config])
  const throughputData = useMemo(() => buildThroughputChart(config), [config])
  const bottlenecks = useMemo(() => detectBottlenecks(config), [config])

  const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length
  const warningCount  = bottlenecks.filter(b => b.severity === 'warning').length

  const zoneUtil = config.zones.map(z => ({
    name: z.name.split(' ').slice(0, 2).join(' '),
    utilisation: Math.round(z.currentUtilization * 100),
    capacity: 100,
  }))

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Operations Dashboard"
        subtitle={`Live overview — ${config.location} · ${config.operations.dailyOrderVolume.toLocaleString()} orders/day`}
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Alert banner */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-800 rounded-xl px-5 py-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm font-medium">
              {criticalCount} critical issue{criticalCount > 1 ? 's' : ''} detected.{' '}
            </span>
            <span className="text-red-400/70 text-sm">
              {warningCount} additional warning{warningCount !== 1 ? 's' : ''} require attention.
            </span>
          </div>
        )}
        {criticalCount === 0 && (
          <div className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-800 rounded-xl px-5 py-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-300 text-sm font-medium">All systems operating within normal parameters.</span>
          </div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-3 gap-5">
          {kpis.map(kpi => <StatCard key={kpi.id} kpi={kpi} />)}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-5 gap-6">
          {/* Throughput area chart */}
          <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold">Order Throughput — Today</h3>
                <p className="text-gray-500 text-sm mt-0.5">Actual vs. target vs. max capacity</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-3.5 h-3.5" /> 6:00–22:00 shift window
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={throughputData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280' }} />
                <ReferenceLine y={throughputData[0]?.target} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target', fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#actualGrad)" strokeWidth={2} name="Actual" />
                <Area type="monotone" dataKey="capacity" stroke="#374151" fill="none" strokeDasharray="3 3" strokeWidth={1.5} name="Capacity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Zone utilisation bar chart */}
          <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1">Zone Utilisation</h3>
            <p className="text-gray-500 text-sm mb-6">Current load per zone</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={zoneUtil} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={85} stroke="#f59e0b" strokeDasharray="3 3" />
                <Bar dataKey="utilisation" radius={[0, 4, 4, 0]} name="Utilisation %"
                  fill="#3b82f6"
                  label={{ position: 'right', fill: '#6b7280', fontSize: 10, formatter: (v: number) => v + '%' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse map + bottleneck list */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3">
            <h3 className="text-white font-semibold mb-3">Warehouse Layout — Live Heatmap</h3>
            <WarehouseMap zones={config.zones} />
          </div>

          <div className="col-span-2">
            <h3 className="text-white font-semibold mb-3">Active Issues</h3>
            <div className="space-y-3">
              {bottlenecks.slice(0, 5).map(bn => (
                <div key={bn.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-white leading-tight">{bn.title}</p>
                    <SeverityBadge severity={bn.severity} />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{bn.description.slice(0, 110)}{bn.description.length > 110 ? '…' : ''}</p>
                  <p className="text-xs text-gray-600 mt-2">{bn.zoneName}</p>
                </div>
              ))}
              {bottlenecks.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No active issues detected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
