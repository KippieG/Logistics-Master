import { useMemo, useRef, useState } from 'react'
import { FileText, Download, Building2, AlertTriangle, Lightbulb, TrendingUp, CheckCircle2, Printer } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { SeverityBadge } from '../components/shared/SeverityBadge'
import { useWarehouseStore } from '../store/warehouseStore'
import { buildKPIs } from '../engine/calculations'
import { detectBottlenecks } from '../engine/bottleneck'
import { generateRecommendations } from '../engine/recommendations'
import clsx from 'clsx'

function ReportSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
        <div className="w-7 h-7 bg-brand-900 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-400" />
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export function ReportPage() {
  const { config } = useWarehouseStore()
  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const kpis = useMemo(() => buildKPIs(config), [config])
  const bottlenecks = useMemo(() => detectBottlenecks(config), [config])
  const recs = useMemo(() => generateRecommendations(config), [config])

  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const criticalCount = bottlenecks.filter(b => b.severity === 'critical').length
  const warningCount  = bottlenecks.filter(b => b.severity === 'warning').length

  const handleExport = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 300))
    window.print()
    setExporting(false)
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Consultant Report" subtitle="Export a professional PDF report for client delivery" />

      <div className="flex-1 p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400 text-sm">Preview of the generated report below. Use Print/Export to save as PDF.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Printer className="w-4 h-4" />
              {exporting ? 'Preparing…' : 'Print / Export PDF'}
            </button>
          </div>
        </div>

        {/* Report body */}
        <div ref={reportRef} className="bg-gray-900 border border-gray-800 rounded-2xl p-10 max-w-4xl mx-auto print:max-w-none print:bg-white print:text-black print:border-0 print:rounded-none print:p-8">

          {/* Cover */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-900/50 border border-brand-800 rounded-xl px-4 py-2 mb-6">
              <FileText className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-medium">Warehouse Optimization Report</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">{config.name}</h1>
            <p className="text-xl text-gray-400 mb-2">{config.client}</p>
            <p className="text-gray-500">{config.location} · {now}</p>
            <div className="mt-8 flex justify-center gap-4">
              {criticalCount > 0 && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-xl px-4 py-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm font-medium">{criticalCount} Critical Issues</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-800 rounded-xl px-4 py-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-sm font-medium">{warningCount} Warnings</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-800 rounded-xl px-4 py-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">{recs.length} Recommendations</span>
              </div>
            </div>
          </div>

          {/* Executive summary */}
          <ReportSection title="Executive Summary" icon={Building2}>
            <div className="bg-gray-800/50 rounded-xl p-5 text-sm text-gray-300 leading-relaxed space-y-3">
              <p>
                This report presents a comprehensive operational analysis of <strong className="text-white">{config.name}</strong>,
                operated by <strong className="text-white">{config.client}</strong> in {config.location}.
                The facility covers <strong className="text-white">{config.totalArea.toLocaleString()} m²</strong> across{' '}
                {config.zones.length} functional zones, currently processing an average of{' '}
                <strong className="text-white">{config.operations.dailyOrderVolume.toLocaleString()} orders per day</strong> with{' '}
                <strong className="text-white">{config.staff.totalHeadcount} FTE</strong> across {config.staff.shifts} shifts.
              </p>
              <p>
                The analysis identified <strong className="text-red-400">{criticalCount} critical bottlenecks</strong> and{' '}
                <strong className="text-amber-400">{warningCount} operational warnings</strong> that are currently limiting throughput
                and increasing cost-per-order. The picking zone represents the primary constraint at{' '}
                {Math.round((config.zones.find(z => z.type === 'picking')?.currentUtilization ?? 0) * 100)}% utilisation.
              </p>
              <p>
                Implementation of the {recs.length} prioritised recommendations in this report is projected to improve
                overall warehouse efficiency by an estimated <strong className="text-emerald-400">18–28%</strong> and
                reduce cost-per-order by <strong className="text-emerald-400">10–22%</strong> within a 6-month horizon.
              </p>
            </div>
          </ReportSection>

          {/* KPIs */}
          <ReportSection title="Key Performance Indicators" icon={TrendingUp}>
            <div className="grid grid-cols-3 gap-3">
              {kpis.map(kpi => (
                <div key={kpi.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className={clsx('text-2xl font-bold tabular-nums',
                      kpi.status === 'critical' ? 'text-red-400' :
                      kpi.status === 'warning'  ? 'text-amber-400' :
                      'text-emerald-400'
                    )}>
                      {typeof kpi.value === 'number' && kpi.value < 10 ? kpi.value.toFixed(2) : kpi.value.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">{kpi.unit}</span>
                    <SeverityBadge severity={kpi.status} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500">{kpi.description}</p>
                </div>
              ))}
            </div>
          </ReportSection>

          {/* Warehouse zones */}
          <ReportSection title="Zone Analysis" icon={Building2}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Zone', 'Type', 'Area', 'Utilisation', 'Staff', 'Rate (ord/h)', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-gray-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.zones.map(z => (
                  <tr key={z.id} className="border-b border-gray-800/60">
                    <td className="py-3 px-3 font-medium text-white">{z.name}</td>
                    <td className="py-3 px-3 text-gray-400 capitalize">{z.type}</td>
                    <td className="py-3 px-3 text-gray-300">{z.area.toLocaleString()} m²</td>
                    <td className="py-3 px-3">
                      <span className={clsx('font-bold tabular-nums',
                        z.currentUtilization >= 0.92 ? 'text-red-400' :
                        z.currentUtilization >= 0.8  ? 'text-amber-400' : 'text-emerald-400'
                      )}>
                        {Math.round(z.currentUtilization * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{z.staffAssigned}</td>
                    <td className="py-3 px-3 text-gray-300">{z.processingRate || '—'}</td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={
                        z.currentUtilization >= 0.92 ? 'critical' :
                        z.currentUtilization >= 0.8  ? 'warning'  : 'good'
                      } />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportSection>

          {/* Critical bottlenecks */}
          {bottlenecks.filter(b => b.severity === 'critical').length > 0 && (
            <ReportSection title="Critical Issues" icon={AlertTriangle}>
              <div className="space-y-3">
                {bottlenecks.filter(b => b.severity === 'critical').map(bn => (
                  <div key={bn.id} className="bg-red-950/20 border border-red-900 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <SeverityBadge severity="critical" />
                      <p className="font-semibold text-white">{bn.title}</p>
                      <span className="text-xs text-gray-500">{bn.zoneName}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{bn.description}</p>
                    <p className="text-sm text-red-300/80">{bn.impact}</p>
                  </div>
                ))}
              </div>
            </ReportSection>
          )}

          {/* Top recommendations */}
          <ReportSection title="Priority Recommendations" icon={Lightbulb}>
            <div className="space-y-4">
              {recs.slice(0, 5).map((rec, idx) => (
                <div key={rec.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <span className="w-7 h-7 bg-brand-900 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-400 font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <p className="font-semibold text-white">{rec.title}</p>
                        <SeverityBadge severity={rec.severity} />
                        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border',
                          rec.effort === 'low' ? 'text-emerald-400 border-emerald-800 bg-emerald-950/40' :
                          rec.effort === 'medium' ? 'text-amber-400 border-amber-800 bg-amber-950/30' :
                          'text-red-400 border-red-800 bg-red-950/30'
                        )}>
                          {rec.effort} effort · {rec.timelineWeeks}w
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Throughput', value: `+${rec.estimatedImpact.throughputGain}%` },
                          { label: 'Efficiency', value: `+${rec.estimatedImpact.efficiencyGain}%` },
                          { label: 'Cost Save', value: `-${rec.estimatedImpact.costReduction}%` },
                          { label: 'Payback', value: `${rec.estimatedImpact.paybackMonths} months` },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-gray-800 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-sm font-bold text-emerald-400">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ReportSection>

          {/* Conclusion */}
          <ReportSection title="Conclusion & Next Steps" icon={CheckCircle2}>
            <div className="bg-gray-800/50 rounded-xl p-5 text-sm text-gray-300 leading-relaxed space-y-3">
              <p>
                The analysis confirms significant optimisation potential in <strong className="text-white">{config.name}</strong>.
                Immediate priority should be given to addressing the {criticalCount} critical bottleneck{criticalCount !== 1 ? 's' : ''},
                particularly in the picking zone which currently limits overall warehouse throughput.
              </p>
              <p>
                We recommend a phased implementation approach: begin with quick wins (low-effort recommendations) within
                the first 4 weeks, followed by structural improvements in the 6–12 week window. This sequencing allows
                early KPI improvements to build the business case for more significant investments.
              </p>
              <p>
                A follow-up review is recommended 90 days after initial implementation to measure KPI progress and
                adjust the optimisation roadmap based on actual performance data.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { phase: 'Phase 1 (Weeks 1–4)', items: recs.filter(r => r.effort === 'low').map(r => r.title) },
                { phase: 'Phase 2 (Weeks 5–12)', items: recs.filter(r => r.effort === 'medium').map(r => r.title) },
                { phase: 'Phase 3 (Weeks 13+)', items: recs.filter(r => r.effort === 'high').map(r => r.title) },
              ].map(({ phase, items }) => (
                <div key={phase} className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-white mb-3">{phase}</p>
                  <ul className="space-y-1.5">
                    {items.slice(0, 4).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item.length > 36 ? item.slice(0, 34) + '…' : item}
                      </li>
                    ))}
                    {items.length === 0 && <li className="text-xs text-gray-600">No items in this phase</li>}
                  </ul>
                </div>
              ))}
            </div>
          </ReportSection>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-700 flex items-center justify-between text-xs text-gray-600">
            <span>Warehouse Optimization Advisor · Consultant Edition</span>
            <span>{now}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
