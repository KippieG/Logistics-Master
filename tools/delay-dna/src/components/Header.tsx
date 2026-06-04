import { Activity } from 'lucide-react';

const R = '#8D1D45';
const Y = '#F8CE3E';

export function Header() {
  const now  = new Date();
  const time = now.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0b0d16]/90 backdrop-blur-sm">
      <div className="ecs-bar" />

      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-ecs-red"
                 style={{ background: `linear-gradient(135deg, ${R} 0%, ${Y} 100%)` }}>
              <Activity size={20} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0b0d16] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="text-2xl font-extrabold tracking-tight text-white">Delay</span>
              <span className="text-2xl font-extrabold tracking-tight"
                    style={{ background: `linear-gradient(90deg, ${R}, ${Y})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                DNA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-none">
              AI Delay Prediction Engine · ECS European Containers
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-1 rounded-full border border-white/8 bg-white/2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live · Zeebrugge HQ
          </div>
        </div>

        {/* Clock + avatar */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-white tabular-nums">{time}</p>
            <p className="text-[11px] text-slate-500">{date}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow"
               style={{ background: `linear-gradient(135deg, ${R}, ${Y})` }}>
            PG
          </div>
        </div>
      </div>
    </header>
  );
}
