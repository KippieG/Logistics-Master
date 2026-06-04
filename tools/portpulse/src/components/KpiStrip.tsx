import { Clock, BarChart2, Euro, Truck, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { kpis } from '../data/terminalData';
import { useTerminal } from '../context/TerminalContext';

interface CardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  goodWhenPositive: boolean;
  delta: number;
  redHighlight?: boolean;
}

function KpiCard({ label, value, sub, icon, iconBg, goodWhenPositive, delta, redHighlight }: CardProps) {
  const isGood = goodWhenPositive ? delta > 0 : delta < 0;
  return (
    <div className={`bg-[#111827] rounded-xl p-4 border flex flex-col gap-3 ${redHighlight ? 'border-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.07)]' : 'border-white/5'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{label}</span>
        <div className={`p-1.5 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <div>
        <p className={`text-2xl font-bold tabular-nums ${redHighlight ? 'text-red-400' : 'text-white'}`}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${isGood ? 'text-green-400' : 'text-red-400'}`}>
        {isGood ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
        <span>{delta > 0 ? '+' : ''}{delta}% vs gisteren</span>
      </div>
    </div>
  );
}

export function KpiStrip() {
  const { terminal } = useTerminal();
  const f = terminal.factor;

  const avgWait       = Math.round(kpis.avgWaitMin * (1 + (f - 1) * 0.6));
  const deadTimeHours = Math.round(kpis.deadTimeHours * f);
  const trucks        = Math.round(kpis.trucksProcessed * f);
  const score         = Math.round(kpis.efficiencyScore / (f ** 0.4));
  const baseRate      = kpis.costToday * f / 86400;

  const [cost, setCost] = useState(kpis.costToday * f);
  useEffect(() => {
    setCost(kpis.costToday * f);
  }, [f]);
  useEffect(() => {
    const t = setInterval(() => setCost(c => c + baseRate), 1000);
    return () => clearInterval(t);
  }, [baseRate]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <KpiCard
        label="Gem. wachttijd" value={`${avgWait} min`} sub="per truck vandaag"
        icon={<Clock size={14} className="text-amber-400" />} iconBg="bg-amber-500/10"
        goodWhenPositive={false} delta={kpis.avgWaitDelta}
      />
      <KpiCard
        label="Dead time" value={`${deadTimeHours.toLocaleString('nl')} uur`} sub="gecumuleerd vandaag"
        icon={<BarChart2 size={14} className="text-orange-400" />} iconBg="bg-orange-500/10"
        goodWhenPositive={false} delta={kpis.deadTimeDelta}
      />

      {/* Cost counter — spans 2 cols on mobile */}
      <div className="bg-[#111827] rounded-xl p-4 border border-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.07)] flex flex-col gap-3 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Kosten vandaag</span>
          <div className="p-1.5 rounded-lg bg-red-500/10"><Euro size={14} className="text-red-400" /></div>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400 tabular-nums">{fmt(cost)}</p>
          <p className="text-xs text-slate-500 mt-0.5">verloren aan dead time</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-red-400">
          <TrendingUp size={12} /><span>+{kpis.costDelta}% vs gisteren</span>
        </div>
      </div>

      <KpiCard
        label="Trucks verwerkt" value={trucks.toLocaleString('nl')} sub="vandaag totaal"
        icon={<Truck size={14} className="text-cyan-400" />} iconBg="bg-cyan-500/10"
        goodWhenPositive={true} delta={kpis.trucksDelta}
      />
      <KpiCard
        label="Efficiëntiescore" value={`${score}/100`} sub="operationeel"
        icon={<Zap size={14} className="text-violet-400" />} iconBg="bg-violet-500/10"
        goodWhenPositive={true} delta={kpis.efficiencyDelta}
      />
    </div>
  );
}
