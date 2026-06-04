import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { supplierRisks } from '../data/shipments';
import { getScoreBarColor } from '../utils/predictor';

function Trend({ t }: { t: string }) {
  if (t === 'improving') return <TrendingDown size={12} className="text-green-400" />;
  if (t === 'worsening') return <TrendingUp   size={12} className="text-red-400"   />;
  return <Minus size={12} className="text-slate-500" />;
}

export function SupplierRiskPanel() {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-base font-semibold text-white">Leverancier &amp; Carrier Risico</h2>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Risicoscore obv historische on-time prestatie
      </p>

      <div className="space-y-3.5">
        {supplierRisks.map((s, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-slate-300 truncate">{s.name}</span>
                <span className="shrink-0 text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">{s.country}</span>
                <Trend t={s.trend} />
              </div>
              <div className="flex items-center gap-3 text-xs shrink-0 ml-2">
                <span className="text-slate-500">{s.onTimeRate}% op tijd</span>
                <span className="font-bold w-6 text-right tabular-nums"
                      style={{ color: getScoreBarColor(s.riskScore) }}>
                  {s.riskScore}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.riskScore}%`, background: getScoreBarColor(s.riskScore), opacity: 0.85 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1"><TrendingDown size={11} className="text-green-400" /> Verbeterend</span>
        <span className="flex items-center gap-1"><Minus       size={11} className="text-slate-400"  /> Stabiel</span>
        <span className="flex items-center gap-1"><TrendingUp  size={11} className="text-red-400"    /> Verslechterend</span>
      </div>
    </div>
  );
}
