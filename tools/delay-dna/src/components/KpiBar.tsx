import { AlertTriangle, CheckCircle, Clock, Package, ShieldAlert, TrendingDown } from 'lucide-react';
import { kpis } from '../data/shipments';

interface CardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: string;   // hex for icon tint + glow
}

function KpiCard({ label, value, sub, icon, color }: CardProps) {
  return (
    <div className="relative flex-1 min-w-[148px] glass rounded-2xl p-5 overflow-hidden
                    hover:scale-[1.02] transition-transform duration-200 cursor-default">
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-15 blur-2xl pointer-events-none"
           style={{ background: color }} />
      <div className="mb-3 inline-flex items-center justify-center w-9 h-9 rounded-xl"
           style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <p className="text-2xl font-extrabold text-white tabular-nums">{value}</p>
      <p className="text-xs font-medium text-slate-300 mt-0.5">{label}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

export function KpiBar() {
  return (
    <div className="flex gap-3 flex-wrap">
      <KpiCard label="Actieve Shipments"       value={kpis.totalActiveShipments}  sub="over alle routes"          icon={<Package size={16}/>}      color="#F8CE3E" />
      <KpiCard label="Kritiek Risico"          value={kpis.criticalRisk}          sub="directe actie vereist"    icon={<ShieldAlert size={16}/>}   color="#8D1D45" />
      <KpiCard label="Hoog Risico"             value={kpis.highRisk}              sub="nauw opvolgen"             icon={<AlertTriangle size={16}/>} color="#c44d2c" />
      <KpiCard label="Voorspelde Vertragingen" value={kpis.predictedDelaysToday}  sub="AI-forecast komende 24u"  icon={<Clock size={16}/>}         color="#F8CE3E" />
      <KpiCard label="Op-Tijd Ratio"           value={`${kpis.onTimeRate}%`}      sub="laatste 30 dagen"          icon={<CheckCircle size={16}/>}   color="#22c55e" />
      <KpiCard label="Gem. Vertraging"         value={`${kpis.avgDelayScore}d`}   sub="wanneer vertraagd"         icon={<TrendingDown size={16}/>}  color="#94a3b8" />
    </div>
  );
}
