import { laneHeatmapData } from '../data/terminalData';

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const LANES = Array.from({ length: 12 }, (_, i) => i + 1);

function congestionColor(score: number): string {
  if (score < 15) return '#1a2e1a';
  if (score < 30) return '#166534';
  if (score < 45) return '#854d0e';
  if (score < 60) return '#b45309';
  if (score < 75) return '#c2410c';
  return '#b91c1c';
}

function congestionTextColor(score: number): string {
  return score > 40 ? '#fff' : '#6b7280';
}

function getGateLabel(lane: number): string {
  if (lane <= 3)  return 'Gate A';
  if (lane <= 6)  return 'Gate B';
  if (lane <= 9)  return 'Gate C';
  return 'Gate D';
}

export function LaneHeatmap() {
  const dataMap = new Map(
    laneHeatmapData.map(d => [`${d.lane}-${d.hour}`, d.congestion])
  );

  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Congestion heatmap — Lane × Uur</h2>
          <p className="text-xs text-slate-500 mt-0.5">Percentage bezettingsgraad per lane per tijdsslot</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block bg-[#166534]" />Laag
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block bg-[#854d0e]" />Matig
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block bg-[#b91c1c]" />Kritiek
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 700 }}>
          {/* Hour labels */}
          <div className="flex mb-1 ml-20">
            {HOURS.map((h, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-slate-600 font-mono">
                {i % 3 === 0 ? h.slice(0, 2) : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {LANES.map(lane => (
            <div key={lane} className="flex items-center mb-0.5 gap-1">
              <div className="w-20 shrink-0 flex items-center justify-between pr-2">
                <span className="text-[10px] text-slate-600 font-mono">Lane {lane}</span>
                <span className="text-[9px] text-slate-700">{getGateLabel(lane)}</span>
              </div>
              {HOURS.map((_, hour) => {
                const score = dataMap.get(`${lane}-${hour}`) ?? 0;
                return (
                  <div
                    key={hour}
                    className="flex-1 h-5 rounded-[2px] flex items-center justify-center cursor-default group relative"
                    style={{ backgroundColor: congestionColor(score) }}
                    title={`Lane ${lane} · ${HOURS[hour]} · ${score}%`}
                  >
                    <span
                      className="text-[8px] font-mono hidden group-hover:block absolute z-10 bg-[#1a2235] px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap pointer-events-none"
                      style={{ color: congestionTextColor(score), bottom: '110%', left: '50%', transform: 'translateX(-50%)' }}
                    >
                      {score}% · Lane {lane} · {HOURS[hour]}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Bottom labels */}
          <div className="flex mt-1 ml-20">
            {HOURS.map((_h, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-slate-700 font-mono">
                {i === 7 ? '↑ ochtend piek' : i === 15 ? '↑ avond piek' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
