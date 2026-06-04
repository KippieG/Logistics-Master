import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { shiftStats } from '../data/terminalData';

interface TooltipPayload {
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const shift = shiftStats.find(s => s.label === label);
  return (
    <div className="bg-[#1a2235] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      <p className="text-white">Score: <span className="font-bold" style={{ color: payload[0]?.color }}>{payload[0]?.value}/100</span></p>
      {shift && <p className="text-slate-400 mt-0.5">Gem. wacht: {shift.avgWait} min · {shift.trucks} trucks</p>}
    </div>
  );
}

export function ShiftAnalysis() {
  const data = shiftStats.map(s => ({ ...s }));

  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Shift performantie</h2>
        <p className="text-xs text-slate-500 mt-0.5">Efficiëntiescore per shift — vandaag</p>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {shiftStats.map(s => (
          <div key={s.shift} className="bg-[#0f1724] rounded-lg p-2.5 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] text-slate-500 capitalize">{s.shift}</span>
            </div>
            <p className="text-lg font-bold text-white">{s.score}<span className="text-xs text-slate-500">/100</span></p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.avgWait} min gem.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
