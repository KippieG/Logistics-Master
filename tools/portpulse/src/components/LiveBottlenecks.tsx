import { MapPin, Clock, Users } from 'lucide-react';
import { bottlenecks } from '../data/terminalData';

const severityLabel = { critical: 'KRITIEK', high: 'HOOG', medium: 'MEDIUM' } as const;
const severityStyle = {
  critical: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', bar: 'bg-red-500', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.15)]' },
  high:     { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', bar: 'bg-amber-500', glow: '' },
  medium:   { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', bar: 'bg-blue-500', glow: '' },
} as const;

export function LiveBottlenecks() {
  const maxWait = Math.max(...bottlenecks.map(b => b.waitMinutes));

  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Live bottlenecks</h2>
          <p className="text-xs text-slate-500 mt-0.5">{bottlenecks.length} actieve verstoringen</p>
        </div>
        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
      </div>

      <div className="space-y-3">
        {bottlenecks.map(b => {
          const s = severityStyle[b.severity];
          return (
            <div key={b.id} className={`bg-[#0f1724] rounded-lg p-3.5 border border-white/5 ${s.glow}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>
                  {severityLabel[b.severity]}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={11} />
                  {b.since}
                </span>
              </div>
              <p className="text-sm font-medium text-white flex items-center gap-1.5 mb-1">
                <MapPin size={12} className="text-slate-500 shrink-0" />
                {b.location}
              </p>
              <p className="text-xs text-slate-400 mb-3">{b.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="flex items-center gap-1"><Users size={11} />{b.affectedTrucks} trucks</span>
                <span className="text-white font-medium">+{b.waitMinutes} min</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${s.bar}`}
                  style={{ width: `${(b.waitMinutes / maxWait) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
