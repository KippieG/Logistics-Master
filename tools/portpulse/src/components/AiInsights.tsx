import { Sparkles, TrendingDown, AlertTriangle, Brain } from 'lucide-react';
import { aiInsights } from '../data/terminalData';

const typeConfig = {
  saving:  { icon: <TrendingDown size={14} className="text-green-400" />,   bg: 'bg-green-500/8',  border: 'border-green-500/15',  label: 'KOSTENBESPARING',  labelColor: 'text-green-400' },
  warning: { icon: <AlertTriangle size={14} className="text-amber-400" />,  bg: 'bg-amber-500/8',  border: 'border-amber-500/15',  label: 'AANDACHTSPUNT',    labelColor: 'text-amber-400' },
  pattern: { icon: <Brain size={14} className="text-violet-400" />,         bg: 'bg-violet-500/8', border: 'border-violet-500/15', label: 'PATROON DETECTIE', labelColor: 'text-violet-400' },
} as const;

export function AiInsights() {
  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={15} className="text-cyan-400" />
        <div>
          <h2 className="text-sm font-semibold text-white">AI aanbevelingen</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gebaseerd op 14 dagen operationele data · {aiInsights.length} nieuwe inzichten</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {aiInsights.map(insight => {
          const cfg = typeConfig[insight.type];
          return (
            <div key={insight.id} className={`rounded-lg p-4 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {cfg.icon}
                  <span className={`text-[10px] font-bold tracking-widest ${cfg.labelColor}`}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-500">AI conf.</span>
                  <span className="text-[10px] font-bold text-slate-300">{insight.confidence}%</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{insight.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{insight.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-600 uppercase tracking-wide">Potentieel</span>
                  <p className={`text-sm font-bold ${insight.type === 'saving' ? 'text-green-400' : insight.type === 'warning' ? 'text-amber-300' : 'text-violet-400'}`}>
                    {insight.impact}
                  </p>
                </div>
                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${insight.type === 'saving' ? 'bg-green-500' : insight.type === 'warning' ? 'bg-amber-500' : 'bg-violet-500'}`}
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
