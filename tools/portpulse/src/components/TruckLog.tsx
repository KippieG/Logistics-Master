import { Clock, CheckCircle2, AlertCircle, Hourglass, Search } from 'lucide-react';
import { useState } from 'react';
import { recentTrucks } from '../data/terminalData';
import type { TruckEvent } from '../types';

const statusConfig = {
  completed: { icon: <CheckCircle2 size={13} className="text-green-400" />,  label: 'Gereed',     color: 'text-green-400'  },
  delayed:   { icon: <AlertCircle  size={13} className="text-red-400" />,    label: 'Vertraging', color: 'text-red-400'    },
  waiting:   { icon: <Hourglass    size={13} className="text-amber-400" />,  label: 'Wachtend',   color: 'text-amber-400'  },
} as const;

type StatusFilter = 'all' | TruckEvent['status'];
type GateFilter   = 'all' | 'Gate A' | 'Gate B' | 'Gate C' | 'Gate D';

export function TruckLog() {
  const [statusF, setStatusF] = useState<StatusFilter>('all');
  const [gateF,   setGateF]   = useState<GateFilter>('all');
  const [search,  setSearch]  = useState('');

  const filtered = recentTrucks.filter(t => {
    if (statusF !== 'all' && t.status !== statusF) return false;
    if (gateF   !== 'all' && t.gate   !== gateF)   return false;
    if (search && !t.plate.toLowerCase().includes(search.toLowerCase()) &&
        !t.contractor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const delayed  = recentTrucks.filter(t => t.status === 'delayed').length;
  const waiting  = recentTrucks.filter(t => t.status === 'waiting').length;

  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Live truck events</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {recentTrucks.length} trucks ·
            <span className="text-amber-400 ml-1">{waiting} wachtend</span> ·
            <span className="text-red-400 ml-1">{delayed} vertraagd</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Zoek kenteken of contractor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 w-52"
            />
          </div>

          {/* Status filter */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(['all', 'completed', 'delayed', 'waiting'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusF(s)}
                className={`px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                  statusF === s ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s === 'all' ? 'Alle' : s === 'completed' ? 'Gereed' : s === 'delayed' ? 'Vertraagd' : 'Wachtend'}
              </button>
            ))}
          </div>

          {/* Gate filter */}
          <select
            value={gateF}
            onChange={e => setGateF(e.target.value as GateFilter)}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-400 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            <option value="all">Alle gates</option>
            <option value="Gate A">Gate A</option>
            <option value="Gate B">Gate B</option>
            <option value="Gate C">Gate C</option>
            <option value="Gate D">Gate D</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              {['Kenteken', 'Gate / Lane', 'Contractor', 'Aankomst', 'Gate klaar', 'Exit', 'Wacht', 'Status'].map(h => (
                <th key={h} className="pb-2.5 text-left text-[10px] text-slate-500 font-semibold uppercase tracking-wide pr-4 last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-slate-600">Geen resultaten voor deze filter</td>
              </tr>
            ) : filtered.map(t => {
              const s = statusConfig[t.status];
              return (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4 font-mono text-slate-200 font-medium">{t.plate}</td>
                  <td className="py-3 pr-4">
                    <span className="text-slate-400">{t.gate}</span>
                    <span className="text-slate-700"> / </span>
                    <span className="text-slate-500">{t.lane}</span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 max-w-[160px] truncate">{t.contractor}</td>
                  <td className="py-3 pr-4 font-mono text-slate-300 flex items-center gap-1">
                    <Clock size={10} className="text-slate-600 shrink-0" />{t.arrived}
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-400">{t.gateCleared}</td>
                  <td className="py-3 pr-4 font-mono text-slate-400">{t.exitTime}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-semibold ${t.waitMin > 60 ? 'text-red-400' : t.waitMin > 40 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {t.waitMin} min
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1.5 ${s.color}`}>{s.icon}{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-600">
        <span>{filtered.length} van {recentTrucks.length} trucks zichtbaar</span>
        <span>Vandaag · 08:41 – 10:33</span>
      </div>
    </div>
  );
}
