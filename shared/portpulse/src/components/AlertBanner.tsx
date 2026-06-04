import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { bottlenecks } from '../data/terminalData';

const severityConfig = {
  critical: { bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-400',    text: 'text-red-400',    label: 'KRITIEK' },
  high:     { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  dot: 'bg-amber-400',  text: 'text-amber-400',  label: 'HOOG'   },
  medium:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   dot: 'bg-blue-400',   text: 'text-blue-400',   label: 'MEDIUM' },
} as const;

export function AlertBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const active = bottlenecks.filter(b => !dismissed.includes(b.id));
  if (active.length === 0) return null;

  return (
    <div className="space-y-2">
      {active.map(b => {
        const cfg = severityConfig[b.severity];
        return (
          <div key={b.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
            <AlertTriangle size={15} className={cfg.text} />
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-bold tracking-widest mr-2 ${cfg.text}`}>{cfg.label}</span>
              <span className="text-sm text-slate-300 font-medium">{b.location}</span>
              <span className="text-slate-500 text-sm"> — {b.description}</span>
              <span className="text-slate-600 text-xs ml-2">+{b.waitMinutes} min · {b.affectedTrucks} trucks · sinds {b.since}</span>
            </div>
            <button
              onClick={() => setDismissed(d => [...d, b.id])}
              className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
