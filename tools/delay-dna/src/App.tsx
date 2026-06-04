import { Header }           from './components/Header';
import { KpiBar }           from './components/KpiBar';
import { ShipmentTable }    from './components/ShipmentTable';
import { RouteChart }       from './components/RouteChart';
import { TrendChart }       from './components/TrendChart';
import { SupplierRiskPanel }from './components/SupplierRiskPanel';
import { FerrySlotPanel }   from './components/FerrySlotPanel';
import { DelayFactorDonut } from './components/DelayFactorDonut';
import { ModelExplainer }   from './components/ModelExplainer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b0d16]">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* KPI strip */}
        <KpiBar />

        {/* Shipment risk table — full width */}
        <ShipmentTable />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RouteChart />
          <TrendChart />
        </div>

        {/* Bottom panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SupplierRiskPanel />
          <FerrySlotPanel />
          <DelayFactorDonut />
        </div>

        {/* AI Model explainer */}
        <ModelExplainer />

        {/* Footer */}
        <footer className="pb-8 text-center space-y-1">
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-600">
            <span>Delay DNA</span>
            <span>·</span>
            <span>AI Logistics Prediction Engine</span>
            <span>·</span>
            <a
              href="https://github.com/KippieG/delay-dna"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-[#F8CE3E] transition-colors"
            >
              github.com/KippieG/delay-dna
            </a>
          </div>
          <p className="text-[11px] text-slate-700">
            Conceptportfolio voor de Digital Solutions Expert rol bij ECS European Containers · Gebouwd door Philippe Godfroy
          </p>
        </footer>
      </main>
    </div>
  );
}
