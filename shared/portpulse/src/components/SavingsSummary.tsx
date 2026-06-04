import { TrendingDown, Lightbulb, Euro } from 'lucide-react';
import { aiInsights } from '../data/terminalData';
import { useTerminal } from '../context/TerminalContext';

export function SavingsSummary() {
  const { terminal } = useTerminal();
  const weeklyBase  = 27000;
  const weekly      = Math.round(weeklyBase * terminal.factor);
  const annual      = weekly * 52;
  const fmt = (n: number) =>
    new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const savings = aiInsights.filter(i => i.type === 'saving');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-green-500/15"><Euro size={16} className="text-green-400" /></div>
          <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">Wekelijks potentieel</span>
        </div>
        <p className="text-3xl font-bold text-green-400">{fmt(weekly)}</p>
        <p className="text-xs text-slate-400 mt-1">te besparen met AI aanbevelingen</p>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-cyan-500/10"><TrendingDown size={16} className="text-cyan-400" /></div>
          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">Jaarlijkse impact</span>
        </div>
        <p className="text-3xl font-bold text-white">{fmt(annual)}</p>
        <p className="text-xs text-slate-500 mt-1">indien alle inzichten worden toegepast</p>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-amber-500/10"><Lightbulb size={16} className="text-amber-400" /></div>
          <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">Snelste winst</span>
        </div>
        <p className="text-sm font-semibold text-white leading-snug">
          {savings[0]?.title ?? 'Lane routing optimalisatie'}
        </p>
        <p className="text-xs text-slate-500 mt-1">{savings[0]?.impact ?? '€18.600 / week'} · conf. {savings[0]?.confidence ?? 87}%</p>
      </div>
    </div>
  );
}
