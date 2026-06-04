import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import {
  Lightbulb, LayoutGrid, Users, Cpu, Package, Repeat2,
  TrendingUp, Clock, DollarSign, Zap, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Header } from '../components/layout/Header'
import { SeverityBadge } from '../components/shared/SeverityBadge'
import { useWarehouseStore } from '../store/warehouseStore'
import { generateRecommendations } from '../engine/recommendations'
import { Recommendation } from '../types/warehouse'
import clsx from 'clsx'

const categoryIcons: Record<Recommendation['category'], React.ElementType> = {
  layout:     LayoutGrid,
  staffing:   Users,
  process:    Repeat2,
  technology: Cpu,
  inventory:  Package,
}

const effortColor: Record<Recommendation['effort'], string> = {
  low:    'text-emerald-400 bg-emerald-950/40 border-emerald-800',
  medium: 'text-amber-400 bg-amber-950/30 border-amber-800',
  high:   'text-red-400 bg-red-950/30 border-red-800',
}

const categoryLabels: Record<Recommendation['category'], string> = {
  layout: 'Layout', staffing: 'Staffing', process: 'Process', technology: 'Technology', inventory: 'Inventory',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-gray-300 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-white">{p.name}: <strong>{p.value}%</strong></p>
      ))}
    </div>
  )
}

function RecCard({ rec }: { rec: Recommendation }) {
  const [open, setOpen] = useState(false)
  const Icon = categoryIcons[rec.category]
  const { estimatedImpact: ei } = rec

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="font-semibold text-white">{rec.title}</p>
              <SeverityBadge severity={rec.severity} />
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border', effortColor[rec.effort])}>
                {rec.effort} effort
              </span>
              <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">
                {categoryLabels[rec.category]}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{rec.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-500">Est. payback</p>
              <p className="text-sm font-bold text-brand-400">{ei.paybackMonths}mo</p>
            </div>
            {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-800 p-5 space-y-5">
          {/* Rationale */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-medium text-amber-300">Rationale</p>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{rec.rationale}</p>
          </div>

          {/* Impact metrics */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: TrendingUp,  label: 'Throughput',  value: `+${ei.throughputGain}%`, color: 'text-emerald-400' },
              { icon: Zap,         label: 'Efficiency',  value: `+${ei.efficiencyGain}%`, color: 'text-blue-400' },
              { icon: DollarSign,  label: 'Cost Saving', value: `-${ei.costReduction}%`,  color: 'text-purple-400' },
              { icon: Clock,       label: 'Timeline',    value: `${rec.timelineWeeks}w`,  color: 'text-amber-400' },
            ].map(({ icon: I, label, value, color }) => (
              <div key={label} className="bg-gray-800 rounded-xl p-3 text-center">
                <I className={clsx('w-4 h-4 mx-auto mb-1', color)} />
                <p className={clsx('text-lg font-bold', color)}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Related zones */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Affects:</span>
            {rec.relatedZones.map(zid => (
              <span key={zid} className="text-xs bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-gray-300">{zid}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function OptimizationPage() {
  const { config } = useWarehouseStore()
  const [filterCat, setFilterCat] = useState<Recommendation['category'] | 'all'>('all')
  const recs = useMemo(() => generateRecommendations(config), [config])

  const filtered = filterCat === 'all' ? recs : recs.filter(r => r.category === filterCat)

  const impactData = recs.map(r => ({
    name: r.title.split(' ').slice(0, 3).join(' '),
    throughput: r.estimatedImpact.throughputGain,
    efficiency: r.estimatedImpact.efficiencyGain,
    cost: r.estimatedImpact.costReduction,
  }))

  const radarData = (Object.keys(categoryLabels) as Recommendation['category'][]).map(cat => ({
    category: categoryLabels[cat],
    count: recs.filter(r => r.category === cat).length * 30,
    impact: Math.round(recs.filter(r => r.category === cat).reduce((s, r) => s + r.estimatedImpact.efficiencyGain, 0) / Math.max(1, recs.filter(r => r.category === cat).length)),
  }))

  const totalThroughputGain = Math.round(recs.reduce((s, r) => s + r.estimatedImpact.throughputGain, 0) * 0.6)
  const totalCostSaving = Math.round(recs.reduce((s, r) => s + r.estimatedImpact.costReduction, 0) * 0.5)
  const quickWins = recs.filter(r => r.effort === 'low').length

  return (
    <div className="flex flex-col flex-1">
      <Header title="Optimization Recommendations" subtitle={`${recs.length} actionable recommendations identified`} />

      <div className="flex-1 p-8 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Recommendations', value: recs.length, color: 'text-brand-400', bg: 'bg-brand-950/30 border-brand-900' },
            { label: 'Quick Wins (Low Effort)', value: quickWins, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900' },
            { label: 'Combined Throughput Gain', value: `+${totalThroughputGain}%`, color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900' },
            { label: 'Combined Cost Reduction', value: `-${totalCostSaving}%`, color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-900' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={clsx('rounded-2xl border p-5', bg)}>
              <p className="text-gray-400 text-sm mb-2">{label}</p>
              <p className={clsx('text-3xl font-bold tabular-nums', color)}>{value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1">Impact per Recommendation</h3>
            <p className="text-gray-500 text-sm mb-4">Estimated % improvement</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={impactData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="throughput" name="Throughput" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="efficiency" name="Efficiency" fill="#a855f7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cost" name="Cost Save" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-1">Category Overview</h3>
            <p className="text-gray-500 text-sm mb-4">Distribution of recommendations by type</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar name="Count" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Impact" dataKey="impact" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 mr-2">Filter:</span>
          {(['all', ...Object.keys(categoryLabels)] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat as any)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                filterCat === cat
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              )}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat as Recommendation['category']]}
              {cat !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">{recs.filter(r => r.category === cat).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Recommendations list */}
        <div className="space-y-4">
          {filtered.map(rec => <RecCard key={rec.id} rec={rec} />)}
        </div>
      </div>
    </div>
  )
}
