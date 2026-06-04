import { LayoutDashboard, BarChart2, Users, Sparkles } from 'lucide-react';

export type Tab = 'dashboard' | 'analyse' | 'contractors' | 'ai';

interface Props { active: Tab; onSelect: (tab: Tab) => void; }

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard',   label: 'Dashboard',    icon: <LayoutDashboard size={14} /> },
  { id: 'analyse',     label: 'Analyse',      icon: <BarChart2 size={14} />       },
  { id: 'contractors', label: 'Contractors',  icon: <Users size={14} />           },
  { id: 'ai',          label: 'AI Insights',  icon: <Sparkles size={14} />, badge: '4' },
];

export function TabNav({ active, onSelect }: Props) {
  return (
    <div className="border-b border-white/5 bg-[#0b0d16]/80 backdrop-blur sticky top-14 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex gap-0">
          {TABS.map(tab => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => onSelect(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : ''}>{tab.icon}</span>
                {tab.label}
                {tab.badge && (
                  <span className="ml-0.5 text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-bold">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
