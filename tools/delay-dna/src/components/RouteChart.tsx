import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { routeStats } from '../data/shipments';
import { getScoreBarColor } from '../utils/predictor';

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row = routeStats.find(r => r.route === label);
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-xs space-y-1">
      <p className="font-semibold text-white mb-1.5">{label}</p>
      <div className="flex justify-between gap-6">
        <span className="text-slate-400">Vertraging %</span>
        <span className="font-semibold" style={{ color: getScoreBarColor(row?.riskScore ?? 50) }}>
          {payload[0]?.value}%
        </span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-slate-400">Gem. vertraging</span>
        <span className="text-white">{row?.avgDelay}d</span>
      </div>
      <div className="flex justify-between gap-6">
        <span className="text-slate-400">Zendingen</span>
        <span className="text-white">{row?.totalShipments}</span>
      </div>
    </div>
  );
};

export function RouteChart() {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-base font-semibold text-white">Vertraging per Route</h2>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        % zendingen vertraagd per corridor · laatste 6 maanden
      </p>
      <ResponsiveContainer width="100%" height={268}>
        <BarChart data={routeStats} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis
            type="number" domain={[0, 50]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false} axisLine={false}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category" dataKey="route" width={175}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false} axisLine={false}
          />
          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
          <Bar dataKey="delayRate" radius={[0, 5, 5, 0]} maxBarSize={18}>
            {routeStats.map((entry, i) => (
              <Cell key={i} fill={getScoreBarColor(entry.riskScore)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
