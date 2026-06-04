import { deadTimeBreakdown } from '../data/terminalData';

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}u ${m}m` : `${m}m`;
}

export function DeadTimeBreakdown() {
  const total = deadTimeBreakdown.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Dead time oorzaken</h2>
        <p className="text-xs text-slate-500 mt-0.5">Verdeling van {fmtMin(total)} verloren tijd vandaag</p>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-5 gap-px">
        {deadTimeBreakdown.map(d => (
          <div
            key={d.name}
            style={{ width: `${d.pct}%`, backgroundColor: d.color }}
            className="transition-all"
            title={`${d.name}: ${d.pct}%`}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2.5">
        {deadTimeBreakdown.map(d => (
          <div key={d.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-slate-300">{d.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">{fmtMin(d.minutes)}</span>
                <span className="w-8 text-right font-semibold text-slate-300">{d.pct}%</span>
              </div>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${d.pct}%`, backgroundColor: d.color, opacity: 0.7 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
