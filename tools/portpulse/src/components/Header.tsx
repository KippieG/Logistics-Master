import { Activity, ChevronDown, Download, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTerminal, TERMINALS, type TerminalId } from '../context/TerminalContext';

export function Header() {
  const { terminal, setTerminalId } = useTerminal();
  const [seconds, setSeconds]       = useState(0);
  const [open, setOpen]             = useState(false);
  const [exported, setExported]     = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleExport() {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  return (
    <header className="border-b border-white/5 bg-[#0b0d16]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo + terminal selector */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center shrink-0">
              <Activity size={14} className="text-black" strokeWidth={3} />
            </div>
            <span className="font-bold text-white tracking-tight">PortPulse</span>
          </div>

          <span className="hidden sm:block text-slate-700 select-none">·</span>

          {/* Terminal dropdown */}
          <div ref={dropRef} className="relative hidden sm:block">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors py-1"
            >
              <span className="text-xs font-semibold text-cyan-500 mr-1 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                {terminal.short}
              </span>
              {terminal.name}
              <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#151e2d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                {TERMINALS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTerminalId(t.id as TerminalId); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${t.id === terminal.id ? 'bg-cyan-500/5' : ''}`}
                  >
                    <span className={`text-[10px] font-bold w-8 text-center px-1 py-0.5 rounded ${t.id === terminal.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-500'}`}>
                      {t.short}
                    </span>
                    <span className={`text-sm ${t.id === terminal.id ? 'text-white' : 'text-slate-400'}`}>{t.name}</span>
                    {t.id === terminal.id && <Check size={13} className="ml-auto text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden md:block text-[11px] text-slate-600">
            Bijgewerkt {seconds}s geleden
          </span>
          <button
            onClick={handleExport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
          >
            {exported ? <Check size={12} className="text-green-400" /> : <Download size={12} />}
            {exported ? 'Geëxporteerd' : 'Exporteer rapport'}
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-green-400 font-semibold tracking-wide">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
