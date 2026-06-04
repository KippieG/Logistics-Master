import { useMemo, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, Map, Users, ArrowLeftRight, Cpu, LayoutGrid,
  Play, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { Header } from '../components/layout/Header'
import { useWarehouseStore } from '../store/warehouseStore'
import { simulationScenarios } from '../data/sampleData'
import { runScenario, getBaseline } from '../engine/simulation'
import { ScenarioResult } from '../types/warehouse'
import clsx from 'clsx'

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, Map, Users, ArrowLeftRight, Cpu, LayoutGrid,
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill ?? p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function DeltaBadge({ base, current, unit, higherIsBetter = true }: {
  base: number; current: number; unit: string; higherIsBetter?: boolean
}) {
  const delta = current - base
  const positive = higherIsBetter ? delta > 0 : delta < 0
  if (Math.abs(delta) < 0.1) return <span className="text-gray-500 text-xs">No change</span>
  return (
    <span className={clsx('text-xs font-semibold', positive ? 'text-emerald-400' : 'text-red-400')}>
      {delta > 0 ? '+' : ''}{typeof delta === 'number' && Math.abs(delta) < 10 ? delta.toFixed(2) : Math.round(delta)}{unit}
    </span>
  )
}

export function SimulationPage() {
  const { config } = useWarehouseStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<{ scenario: typeof simulationScenarios[0]; result: ScenarioResult }[] | null>(null)

  const baseline = useMemo(() => getBaseline(config), [config])

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const runAll = async () => {
    setRunning(true)
    await new Promise(r => setTimeout(r, 800))
    const selected = simulationScenarios.filter(s => selectedIds.has(s.id))
    const r = selected.map(s => ({ scenario: s, result: runScenario(config, s) }))
    setResults(r)
    setRunning(false)
  }

  const allResults = results
    ? [{ scenario: { id: 'baseline', name: 'Current Baseline', description: '', icon: 'TrendingUp', modifications: {} }, result: baseline }, ...results]
    : null

  const radarData = allResults
    ? ['throughput', 'efficiency', 'utilization'].map(key => {
        const row: Record<string, any> = {
          metric: key.charAt(0).toUpperCase() + key.slice(1),
        }
        allResults.forEach(({ scenario, result }) => {
          row[scenario.name] = result[key as keyof ScenarioResult]
        })
        return row
      })
    : []

  const barData = allResults
    ? allResults.map(({ scenario, result }) => ({
        name: scenario.name.split(' ').slice(0, 2).join(' '),
        throughput: result.throughput,
        efficiency: result.efficiency,
        costPerOrder: Math.round(result.costPerOrder * 100) / 100,
        leadTime: result.leadTime,
      }))
    : []

  const COLORS = ['#6b7280', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4']

  return (
    <div className="flex flex-col flex-1">
      <Header title="Scenario Simulation" subtitle="Model what-if scenarios and compare outcomes against baseline" />

      <div className="flex-1 p-8 space-y-8">
        {/* Baseline */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-gray-400" /> Current Baseline
          </h3>
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Throughput', value: baseline.throughput, unit: 'ord/h' },
              { label: 'Efficiency', value: baseline.efficiency, unit: '%' },
              { label: 'Avg Utilisation', value: baseline.utilization, unit: '%' },
              { label: 'Lead Time', value: baseline.leadTime, unit: 'h' },
              { label: 'Cost/Order', value: `€${baseline.costPerOrder}`, unit: '' },
              { label: 'Bottleneck Score', value: baseline.bottleneckScore, unit: '/100' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-white tabular-nums">{value}<span className="text-gray-500 text-sm ml-1">{unit}</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario selector */}
        <div>
          <h3 className="text-white font-semibold mb-4">Select Scenarios to Simulate</h3>
          <div className="grid grid-cols-3 gap-4">
            {simulationScenarios.map(sc => {
              const Icon = iconMap[sc.icon] ?? TrendingUp
              const selected = selectedIds.has(sc.id)
              return (
                <button
                  key={sc.id}
                  onClick={() => toggle(sc.id)}
                  className={clsx(
                    'flex items-start gap-4 p-5 rounded-2xl border text-left transition-all',
                    selected
                      ? 'border-brand-600 bg-brand-950/40 ring-1 ring-brand-800'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  )}
                >
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', selected ? 'bg-brand-600' : 'bg-gray-800')}>
                    <Icon className={clsx('w-5 h-5', selected ? 'text-white' : 'text-gray-400')} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm mb-1">{sc.name}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{sc.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Run button */}
        <div className="flex items-center gap-4">
          <button
            onClick={runAll}
            disabled={selectedIds.size === 0 || running}
            className={clsx(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all',
              selectedIds.size === 0 || running
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-500 text-white'
            )}
          >
            <Play className="w-4 h-4" />
            {running ? 'Simulating…' : `Run ${selectedIds.size} Scenario${selectedIds.size !== 1 ? 's' : ''}`}
          </button>
          {selectedIds.size === 0 && <p className="text-sm text-gray-500">Select at least one scenario above</p>}
        </div>

        {/* Results */}
        {allResults && (
          <div className="space-y-6">
            <h3 className="text-white font-semibold">Simulation Results</h3>

            {/* Comparison table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-4 text-gray-400 font-medium">Scenario</th>
                    <th className="text-right px-4 py-4 text-gray-400 font-medium">Throughput</th>
                    <th className="text-right px-4 py-4 text-gray-400 font-medium">Efficiency</th>
                    <th className="text-right px-4 py-4 text-gray-400 font-medium">Cost/Order</th>
                    <th className="text-right px-4 py-4 text-gray-400 font-medium">Lead Time</th>
                    <th className="text-right px-6 py-4 text-gray-400 font-medium">Bottleneck</th>
                  </tr>
                </thead>
                <tbody>
                  {allResults.map(({ scenario, result }, i) => (
                    <tr key={scenario.id} className={clsx('border-b border-gray-800/60', i === 0 ? 'bg-gray-800/20' : 'hover:bg-gray-800/30')}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                          <span className="font-medium text-white">{scenario.name}</span>
                          {i === 0 && <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">baseline</span>}
                        </div>
                      </td>
                      <td className="text-right px-4 py-4">
                        <p className="text-white font-semibold tabular-nums">{result.throughput} <span className="text-gray-500 text-xs">ord/h</span></p>
                        {i > 0 && <DeltaBadge base={baseline.throughput} current={result.throughput} unit=" ord/h" />}
                      </td>
                      <td className="text-right px-4 py-4">
                        <p className="text-white font-semibold tabular-nums">{result.efficiency}%</p>
                        {i > 0 && <DeltaBadge base={baseline.efficiency} current={result.efficiency} unit="%" />}
                      </td>
                      <td className="text-right px-4 py-4">
                        <p className="text-white font-semibold tabular-nums">€{result.costPerOrder}</p>
                        {i > 0 && <DeltaBadge base={baseline.costPerOrder} current={result.costPerOrder} unit="€" higherIsBetter={false} />}
                      </td>
                      <td className="text-right px-4 py-4">
                        <p className="text-white font-semibold tabular-nums">{result.leadTime}h</p>
                        {i > 0 && <DeltaBadge base={baseline.leadTime} current={result.leadTime} unit="h" higherIsBetter={false} />}
                      </td>
                      <td className="text-right px-6 py-4">
                        <p className={clsx('font-bold tabular-nums', result.bottleneckScore > 50 ? 'text-red-400' : result.bottleneckScore > 25 ? 'text-amber-400' : 'text-emerald-400')}>
                          {result.bottleneckScore}
                        </p>
                        {i > 0 && <DeltaBadge base={baseline.bottleneckScore} current={result.bottleneckScore} unit="" higherIsBetter={false} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Throughput & Efficiency Comparison</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
                    <Bar dataKey="throughput" name="Throughput (ord/h)" radius={[3, 3, 0, 0]}>
                      {barData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Multi-Metric Radar</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    {allResults.map(({ scenario }, i) => (
                      <Radar key={scenario.id} name={scenario.name} dataKey={scenario.name}
                        stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
