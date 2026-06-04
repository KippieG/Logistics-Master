import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { useState } from 'react';
import { contractorStats } from '../data/terminalData';

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 80 ? 'bg-green-500/15 text-green-400 border-green-500/25' :
    score >= 65 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
    score >= 50 ? 'bg-orange-500/15 text-orange-400 border-orange-500/25' :
                  'bg-red-500/15 text-red-400 border-red-500/25';
  return (
    <span className={`inline-flex items-center justify-center w-9 h-6 rounded-md border text-xs font-bold tabular-nums ${cls}`}>
      {score}
    </span>
  );
}

function TrendIcon({ trend }: { trend: 'improving' | 'stable' | 'worsening' }) {
  if (trend === 'improving') return <TrendingDown size={13} className="text-green-400" />;
  if (trend === 'worsening') return <TrendingUp   size={13} className="text-red-400"   />;
  return <Minus size={13} className="text-slate-500" />;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444';
  return (
    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  );
}

export function ContractorTable() {
  const [search, setSearch] = useState('');
  const filtered = [...contractorStats]
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Contractor ranking</h2>
          <p className="text-xs text-slate-500 mt-0.5">Efficiëntiescore op basis van wachttijd + on-time rate</p>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Zoek contractor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-xs bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 w-44"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-2.5 text-left text-[10px] text-slate-500 font-semibold uppercase tracking-wide w-6">#</th>
              <th className="pb-2.5 text-left text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Contractor</th>
              <th className="pb-2.5 text-right text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Score</th>
              <th className="pb-2.5 text-right text-[10px] text-slate-500 font-semibold uppercase tracking-wide hidden sm:table-cell">Wacht</th>
              <th className="pb-2.5 text-right text-[10px] text-slate-500 font-semibold uppercase tracking-wide hidden md:table-cell">On time</th>
              <th className="pb-2.5 text-right text-[10px] text-slate-500 font-semibold uppercase tracking-wide hidden lg:table-cell">Kosten</th>
              <th className="pb-2.5 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c, i) => (
              <tr key={c.id} className="group hover:bg-white/[0.025] transition-colors">
                <td className="py-3 pr-3 text-slate-600 font-mono">{i + 1}</td>
                <td className="py-3 pr-4">
                  <div>
                    <p className="text-slate-200 font-medium">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-slate-600 text-[10px]">{c.shift}</p>
                      <ScoreBar score={c.score} />
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right"><ScoreBadge score={c.score} /></td>
                <td className="py-3 text-right hidden sm:table-cell">
                  <span className={c.avgWait > 45 ? 'text-red-400 font-semibold' : c.avgWait > 30 ? 'text-amber-400' : 'text-green-400'}>
                    {c.avgWait} min
                  </span>
                </td>
                <td className="py-3 text-right text-slate-300 hidden md:table-cell">{c.onTimeRate}%</td>
                <td className="py-3 text-right text-slate-400 hidden lg:table-cell">€{c.costImpact.toLocaleString('nl')}</td>
                <td className="py-3 text-center"><TrendIcon trend={c.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom insight */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2 bg-amber-500/5 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
        <span className="text-[10px] font-bold text-amber-400 mt-0.5 shrink-0">TIP</span>
        <p className="text-xs text-slate-400">
          Noord Cargo BV presteert <span className="text-red-400 font-medium">62% slechter</span> dan de top contractor.
          Vervanging bespaart <span className="text-green-400 font-medium">~€2.400/week</span> aan dead time.
        </p>
      </div>
    </div>
  );
}
