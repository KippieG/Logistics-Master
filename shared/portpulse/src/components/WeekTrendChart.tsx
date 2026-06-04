import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { weekTrendData } from '../data/terminalData';

interface TPayload { value: number; color: string; name: string; }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2235] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-2 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white">
          {p.name}: <span className="font-bold" style={{ color: p.color }}>{p.value}{p.name === 'Score' ? '/100' : p.name === 'Wachttijd' ? ' min' : ' trucks'}</span>
        </p>
      ))}
    </div>
  );
}

export function WeekTrendChart() {
  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Week overzicht</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gemiddelde wachttijd & efficiëntiescore per dag — afgelopen week</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#1d4ed8]/60" />Trucks</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-amber-400 rounded" />Wachttijd</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-green-400 rounded" />Score</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={weekTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="trucks" orientation="left"  tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="score"  orientation="right" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend wrapperStyle={{ display: 'none' }} />
          <Bar    yAxisId="trucks" dataKey="trucks"  name="Trucks"     fill="#1d4ed8" fillOpacity={0.5} radius={[3,3,0,0]} barSize={32} />
          <Line   yAxisId="score"  dataKey="avgWait" name="Wachttijd"  stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
          <Line   yAxisId="score"  dataKey="score"   name="Score"      stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Day summary pills */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {weekTrendData.map(d => (
          <div key={d.day} className="bg-[#0f1724] rounded-lg p-2 text-center border border-white/5">
            <p className="text-[10px] text-slate-500 font-medium">{d.day}</p>
            <p className={`text-xs font-bold mt-0.5 ${d.score >= 75 ? 'text-green-400' : d.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {d.score}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
