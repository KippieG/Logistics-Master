import { ferrySlots } from '../data/shipments';
import { getScoreBarColor } from '../utils/predictor';

export function FerrySlotPanel() {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-base font-semibold text-white">Ferry Slot Risico</h2>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        Vertragingskans en capaciteitsbezetting per vertrekslot
      </p>

      <div className="space-y-2.5">
        {ferrySlots.map((slot, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.025] border border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">{slot.slot}</p>
                <p className="text-[11px] text-slate-500">{slot.route}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums"
                   style={{ color: getScoreBarColor(slot.delayRate * 2.2) }}>
                  {slot.delayRate}%
                </p>
                <p className="text-[11px] text-slate-500">vertraging</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Risico</span>
                  <span className="text-slate-400">{slot.delayRate}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{ width: `${slot.delayRate}%`, background: getScoreBarColor(slot.delayRate * 2.2) }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Capaciteit</span>
                  <span className="text-slate-400">{slot.fill}/{slot.capacity}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{ width: `${(slot.fill / slot.capacity) * 100}%`,
                                background: 'linear-gradient(90deg, #8D1D45, #F8CE3E)' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
