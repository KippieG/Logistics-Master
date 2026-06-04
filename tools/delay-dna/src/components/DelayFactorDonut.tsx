import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const factors = [
  { name: 'Douane & Brexit',      value: 34, color: '#8D1D45' },
  { name: 'Havencapaciteit',      value: 26, color: '#F8CE3E' },
  { name: 'Weer / zeeomstandig.', value: 18, color: '#3b82f6' },
  { name: 'Leveranciersfout',     value: 12, color: '#a855f7' },
  { name: 'Ferry capaciteit',     value:  7, color: '#14b8a6' },
  { name: 'Infrastructuur',       value:  3, color: '#64748b' },
];

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-xs">
      <p style={{ color: payload[0].payload.color }} className="font-semibold">{payload[0].name}</p>
      <p className="text-white mt-0.5">{payload[0].value}% van alle vertragingen</p>
    </div>
  );
};

export function DelayFactorDonut() {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-base font-semibold text-white">Oorzaken van Vertragingen</h2>
      <p className="text-xs text-slate-500 mt-0.5 mb-1">
        Verdeling over alle routes · laatste 6 maanden
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={factors} cx="50%" cy="50%"
            innerRadius={58} outerRadius={84}
            paddingAngle={2} dataKey="value" strokeWidth={0}
          >
            {factors.map((f, i) => <Cell key={i} fill={f.color} fillOpacity={0.9} />)}
          </Pie>
          <Tooltip content={<Tip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
        {factors.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: f.color }} />
            <span className="text-slate-400 truncate">{f.name}</span>
            <span className="text-slate-500 ml-auto font-medium">{f.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
