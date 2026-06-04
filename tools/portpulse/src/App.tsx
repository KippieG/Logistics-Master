import { useState }          from 'react';
import { TerminalProvider }  from './context/TerminalContext';
import { Header }            from './components/Header';
import { TabNav, type Tab }  from './components/TabNav';
import { KpiStrip }          from './components/KpiStrip';
import { AlertBanner }       from './components/AlertBanner';
import { WaitTimeChart }     from './components/WaitTimeChart';
import { LiveBottlenecks }   from './components/LiveBottlenecks';
import { LaneHeatmap }       from './components/LaneHeatmap';
import { ContractorTable }   from './components/ContractorTable';
import { ShiftAnalysis }     from './components/ShiftAnalysis';
import { AiInsights }        from './components/AiInsights';
import { SavingsSummary }    from './components/SavingsSummary';
import { TruckLog }          from './components/TruckLog';
import { WeekTrendChart }    from './components/WeekTrendChart';
import { DeadTimeBreakdown } from './components/DeadTimeBreakdown';

function Footer() {
  return (
    <footer className="pb-10 pt-6 text-center space-y-1.5 border-t border-white/5">
      <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-500">PortPulse</span>
        <span>·</span>
        <span>Dead Time Analytics voor haventerminals</span>
        <span>·</span>
        <a
          href="https://portpulse-blue.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-cyan-400 transition-colors"
        >
          portpulse-blue.vercel.app
        </a>
      </div>
      <p className="text-[11px] text-slate-700">
        Gebouwd door Philippe Godfroy · Zeebrugge · 2026
      </p>
    </footer>
  );
}

function DashboardTab() {
  return (
    <>
      <KpiStrip />
      <AlertBanner />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><WaitTimeChart /></div>
        <LiveBottlenecks />
      </div>
      <TruckLog />
    </>
  );
}

function AnalyseTab() {
  return (
    <>
      <WeekTrendChart />
      <LaneHeatmap />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ShiftAnalysis />
        <DeadTimeBreakdown />
      </div>
    </>
  );
}

function ContractorsTab() {
  return (
    <>
      <ContractorTable />
    </>
  );
}

function AiTab() {
  return (
    <>
      <SavingsSummary />
      <AiInsights />
    </>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <TerminalProvider>
      <div className="min-h-screen bg-[#0b0d16]">
        {/* Subtle top glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-cyan-500/5 blur-[80px] pointer-events-none" />

        <Header />
        <TabNav active={activeTab} onSelect={setActiveTab} />

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-4 relative">
          {activeTab === 'dashboard'   && <DashboardTab />}
          {activeTab === 'analyse'     && <AnalyseTab />}
          {activeTab === 'contractors' && <ContractorsTab />}
          {activeTab === 'ai'          && <AiTab />}
          <Footer />
        </main>
      </div>
    </TerminalProvider>
  );
}
