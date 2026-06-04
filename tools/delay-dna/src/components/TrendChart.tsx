import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart
} from 'recharts';
import { delayTrend } from '../data/shipments';

const R = '#8D1D45';
const Y = '#F8CE3E';

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-xs space-y-1">
      <p className="font-semibold text-white mb-1.5">{label} 2024</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-6">
          <span className="text-slate-400">{p.name}</span>
          <span style={{ color: p.color }} className="font-semibold">
            {p.value}{p.dataKey === 'onTime' ? '%' : 'd'}
          </span>
        </div>
      ))}
    </div>
  );
};

export function TrendChart() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Vertraging Trend 2024</h2>
          <p className="text-xs text-slate-500 mt-0.5">Maandelijkse gem. vertraging + op-tijd prestatie</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ background: R }} />
            Vertraging (d)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded" style={{ background: Y }} />
            Op-tijd %
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <ComposedChart data={delayTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={R} stopOpacity={0.4} />
              <stop offset="95%" stopColor={R} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis                  tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
          <Area
            type="monotone" dataKey="avgDelay" name="Vertraging"
            stroke={R} strokeWidth={2.5} fill="url(#delayGrad)" dot={false}
          />
          <Line
            type="monotone" dataKey="onTime" name="Op-tijd"
            stroke={Y} strokeWidth={2.5} dot={{ fill: Y, r: 3, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
