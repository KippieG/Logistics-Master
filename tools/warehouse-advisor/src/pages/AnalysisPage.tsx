import { useMemo, useState } from 'react'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { Header } from '../components/layout/Header'
import { SeverityBadge } from '../components/shared/SeverityBadge'
import { WarehouseMap } from '../components/shared/WarehouseMap'
import { useWarehouseStore } from '../store/warehouseStore'
import { detectBottlenecks } from '../engine/bottleneck'
import { Bottleneck, Severity } from '../types/warehouse'
import clsx from 'clsx'

const SevIcon: Record<Severity, React.ElementType> = {
  critical: AlertTriangle,
  warning:  AlertCircle,
  info:     Info,
  good:     CheckCircle2,
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-gray-400 font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-white">{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

function BottleneckCard({ bn }: { bn: Bottleneck }) {
  const [open, setOpen] = useState(false)
  const Icon = SevIcon[bn.severity]

  const severityBorder: Record<Severity, string> = {
    critical: 'border-red-800',
    warning:  'border-amber-800',
    info:     'border-blue-800',
    good:     'border-emerald-800',
  }

  return (
    <div className={clsx('bg-gray-900 border rounded-2xl overflow-hidden transition-all', severityBorder[bn.severity])}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-4 p-5 hover:bg-gray-800/50 transition-colors text-left"
      >
        <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5',
          bn.severity === 'critical' ? 'text-red-400' :
          bn.severity === 'warning'  ? 'text-amber-400' :
          bn.severity === 'info'     ? 'text-blue-400' : 'text-emerald-400'
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <p className="font-semibold text-white">{bn.title}</p>
            <SeverityBadge severity={bn.severity} />
          </div>
          <p className="text-sm text-gray-400">{bn.description}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className="text-xs text-gray-500">{bn.zoneName}</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 px-5 pb-5 pt-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Metric</p>
              <p className="text-sm font-medium text-white">{bn.metric}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Actual Value</p>
              <p className="text-sm font-bold text-red-400">{Math.round(bn.value * 10) / 10}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Threshold</p>
              <p className="text-sm font-bold text-amber-400">{Math.round(bn.threshold * 10) / 10}</p>
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-medium text-amber-300">Business Impact</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{bn.impact}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function AnalysisPage() {
  const { config } = useWarehouseStore()
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>()
  const bottlenecks = useMemo(() => detectBottlenecks(config), [config])

  const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length
  const warningCount  = bottlenecks.filter(b => b.severity === 'warning').length

  const radarData = config.zones
    .filter(z => z.processingRate > 0)
    .map(z => ({
      zone: z.name.split(' ')[0],
      utilisation: Math.round(z.currentUtilization * 100),
      throughput: Math.round((z.processingRate / 250) * 100),
      staffing: Math.round(Math.min((z.staffAssigned / 10) * 100, 100)),
    }))

  const travelData = config.zones
    .filter(z => z.travelDistance > 0)
    .map(z => ({ name: z.name.split(' ').slice(0, 2).join(' '), distance: z.travelDistance, optimal: 35 }))

  const filtered = selectedZoneId
    ? bottlenecks.filter(b => b.zoneId === selectedZoneId)
    : bottlenecks

  return (
    <div className="flex flex-col flex-1">
      <Header title="Bottleneck Analysis" subtitle={`${bottlenecks.length} issues detected — ${criticalCount} critical, ${warningCount} warnings`} />

      <div className="flex-1 p-8 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Critical Issues', value: criticalCount, color: 'text-red-400', bg: 'bg-red-950/30 border-red-900' },
            { label: 'Warnings', value: warningCount, color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900' },
            { label: 'Zones Affected', value: new Set(bottlenecks.map(b => b.zoneId)).size, color: 'text-blue-400', bg: 'bg-blue-950/20 border-blue-900' },
            { label: 'Clear Zones', value: config.zones.length - new Set(bottlenecks.map(b => b.zoneId)).size, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={clsx('rounded-2xl border p-5', bg)}>
              <p className="text-gray-400 text-sm mb-2">{label}</p>
              <p className={clsx('text-4xl font-bold tabular-nums', color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Radar */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1">Zone Performance Radar</h3>
            <p className="text-gray-500 text-sm mb-4">Utilisation · Throughput · Staffing (0–100)</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="zone" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar name="Utilisation" dataKey="utilisation" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Throughput" dataKey="throughput" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Staffing" dataKey="staffing" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Travel distance chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1">Travel Distance Analysis</h3>
            <p className="text-gray-500 text-sm mb-4">Avg meters from zone to next — optimal &lt; 35m</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={travelData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} unit="m" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="distance" name="Distance (m)" radius={[4, 4, 0, 0]}>
                  {travelData.map((entry, i) => (
                    <Cell key={i} fill={entry.distance > 60 ? '#ef4444' : entry.distance > 45 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
                <Bar dataKey="optimal" name="Optimal (m)" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Map + bottleneck list */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 space-y-4">
            <h3 className="text-white font-semibold">Select Zone to Filter</h3>
            <WarehouseMap
              zones={config.zones}
              onZoneClick={z => setSelectedZoneId(id => id === z.id ? undefined : z.id)}
              selectedZoneId={selectedZoneId}
            />
            {selectedZoneId && (
              <button onClick={() => setSelectedZoneId(undefined)}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                ← Clear zone filter
              </button>
            )}
          </div>

          <div className="col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Issue Details</h3>
              <span className="text-xs text-gray-500">{filtered.length} issue{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map(bn => <BottleneckCard key={bn.id} bn={bn} />)}
              {filtered.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-white font-medium">No issues for this zone</p>
                  <p className="text-gray-500 text-sm mt-1">This zone is operating within normal parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
