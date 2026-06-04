import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { hourlyData } from '../data/terminalData';

interface TooltipPayload {
  value: number;
  name: string;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const wait = payload[0]?.value;
  const trucks = payload[1]?.value;
  return (
    <div className="bg-[#1a2235] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      <p className="text-white">Wachttijd: <span className="text-cyan-400 font-bold">{wait} min</span></p>
      <p className="text-white">Trucks: <span className="text-violet-400 font-bold">{trucks}</span></p>
    </div>
  );
}

export function WaitTimeChart() {
  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Wachttijd per uur</h2>
          <p className="text-xs text-slate-500 mt-0.5">Gemiddelde minuten per truck — vandaag</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-cyan-400 rounded" />Wachttijd</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-violet-400 rounded" />Trucks</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={hourlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="truckGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.20} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#4b5563', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1 }} />
          <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'KPI max', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
          <Area type="monotone" dataKey="avgWait"  stroke="#06b6d4" strokeWidth={2} fill="url(#waitGrad)"  dot={false} />
          <Area type="monotone" dataKey="trucks"   stroke="#8b5cf6" strokeWidth={1.5} fill="url(#truckGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
