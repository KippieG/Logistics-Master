import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../shared/services/api.service';
import { ConsolidationResult, LoadedPallet } from '../shared/models/trailer.model';

@Component({
  selector: 'app-trailer-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-header">
        <div>
          <h2 class="section-title">Super Mega Trailer Optimizer</h2>
          <p class="section-sub">ConsolidationEngine · DDD · zwaar onderaan, licht bovenaan · 3m60 hoogte</p>
        </div>
        <button class="run-btn" (click)="runDemo()" [disabled]="loading">
          <svg *ngIf="!loading" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9.555 7.168A1 1 0 0 0 8 8v4a1 1 0 0 0 1.555.832l3-2a1 1 0 0 0 0-1.664l-3-2z"/></svg>
          <span class="spin" *ngIf="loading">⟳</span>
          {{ loading ? 'Optimaliseren…' : 'Demo Optimalisatie' }}
        </button>
      </div>

      <!-- Stats -->
      <div *ngIf="result" class="stats-grid">
        <div class="stat">
          <div class="stat-val">{{ result.trailer.volumeUtilizationPct }}%</div>
          <div class="stat-label">Volume benut</div>
          <div class="stat-bar"><div class="stat-fill" [style.width.%]="result.trailer.volumeUtilizationPct"></div></div>
        </div>
        <div class="stat">
          <div class="stat-val">{{ result.trailer.loadedPallets.length }}<span class="stat-of">/{{ result.trailer.loadedPallets.length + result.unassignedPallets.length }}</span></div>
          <div class="stat-label">Pallets geladen</div>
        </div>
        <div class="stat stat-eco">
          <div class="stat-val">{{ result.estimatedCo2SavedKg | number:'1.0-0' }} kg</div>
          <div class="stat-label">CO₂ bespaard</div>
        </div>
        <div class="stat">
          <div class="stat-val">{{ result.trailer.totalWeightKg | number:'1.0-0' }}</div>
          <div class="stat-label">kg totaalgewicht</div>
        </div>
      </div>

      <!-- Summary -->
      <div *ngIf="result" class="summary-bar">
        <span class="trailer-tag">{{ result.trailer.trailerNumber }}</span>
        <span class="dest-tag">→ {{ result.trailer.destination }}</span>
        <span class="height-tag">⬍ Super Mega Trailer 3m60</span>
        <span class="summary-text">{{ result.optimizationSummary }}</span>
      </div>

      <!-- Visual Bay -->
      <div *ngIf="result" class="bay-section">
        <div class="bay-label">
          <span>Laadruimte (bovenaanzicht · {{ result.trailer.loadedPallets.length }} pallets)</span>
        </div>
        <div class="bay-frame">
          <div class="bay-grid">
            <div
              *ngFor="let lp of result.trailer.loadedPallets"
              class="pallet"
              [class]="'cargo-' + lp.pallet.cargoType.toLowerCase()"
              [style.height.px]="palletH(lp)"
              [title]="palletTip(lp)"
            >
              <span class="pallet-cl">{{ lp.pallet.client.split(' ')[0] }}</span>
              <span class="pallet-wt">{{ lp.pallet.weightKg | number:'1.0-0' }}kg</span>
            </div>
          </div>
        </div>

        <div class="legend">
          <span class="leg cargo-fmcg">FMCG</span>
          <span class="leg cargo-ambient">Ambient</span>
          <span class="leg cargo-chilled">Gekoeld</span>
          <span class="leg cargo-frozen">Diepvries</span>
        </div>
      </div>

      <!-- Unassigned -->
      <div *ngIf="result && result.unassignedPallets.length > 0" class="unassigned">
        <span class="ua-num">{{ result.unassignedPallets.length }} pallets</span>
        niet ingepast — extra trailer vereist
      </div>

      <!-- Empty state -->
      <div *ngIf="!result && !loading" class="empty">
        <div class="empty-icon">
          <svg viewBox="0 0 64 64" fill="none">
            <rect x="4" y="28" width="56" height="24" rx="4" fill="#2d1a22" stroke="#8D1D45" stroke-width="2"/>
            <rect x="8" y="22" width="40" height="8" rx="2" fill="#8D1D45" opacity=".6"/>
            <circle cx="16" cy="56" r="5" fill="#8D1D45"/>
            <circle cx="48" cy="56" r="5" fill="#8D1D45"/>
            <path d="M60 36 L60 52" stroke="#F8CE3E" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-title">Klik op "Demo Optimalisatie"</p>
        <p class="empty-sub">De ConsolidationEngine sorteert 28 demo-pallets op gewicht & dichtheid<br>voor maximale benutting van de ECS Super Mega Trailer (3m60).</p>
      </div>
    </div>
  `,
  styles: [`
    .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .section-sub { font-size: 0.68rem; color: var(--text-muted); margin-top: 2px; }

    .run-btn {
      display: flex; align-items: center; gap: 7px;
      background: var(--ecs-primary); color: white;
      border: none; padding: 9px 18px; border-radius: 9px;
      cursor: pointer; font-size: 0.82rem; font-weight: 700;
      font-family: inherit; transition: background 0.15s; flex-shrink: 0;
    }
    .run-btn svg { width: 16px; height: 16px; }
    .run-btn:hover { background: var(--ecs-primary-light); }
    .run-btn:disabled { opacity: .5; cursor: not-allowed; }
    .spin { display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 14px; }
    .stat {
      background: var(--bg-root); border: 1px solid var(--bg-border);
      border-radius: 10px; padding: 12px 14px;
    }
    .stat.stat-eco { border-color: var(--ecs-primary-dark); background: #1a0010; }
    .stat-val { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); }
    .stat.stat-eco .stat-val { color: var(--ecs-accent); }
    .stat-of { font-size: 0.9rem; font-weight: 400; color: var(--text-muted); }
    .stat-label { font-size: 0.62rem; color: var(--text-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: .4px; }
    .stat-bar { height: 3px; background: var(--bg-dark); border-radius: 2px; margin-top: 8px; overflow: hidden; }
    .stat-fill { height: 100%; background: linear-gradient(90deg, var(--ecs-primary), var(--ecs-accent)); border-radius: 2px; }

    .summary-bar {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      background: var(--bg-root); border: 1px solid var(--bg-border);
      border-radius: 8px; padding: 10px 14px; margin-bottom: 16px;
      font-size: 0.72rem;
    }
    .trailer-tag { background: var(--ecs-primary); color: white; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-family: monospace; }
    .dest-tag { color: var(--text-secondary); }
    .height-tag { background: var(--status-warn-bg); color: var(--ecs-accent); padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; }
    .summary-text { color: var(--text-muted); }

    .bay-section { margin-bottom: 14px; }
    .bay-label { font-size: 0.68rem; color: var(--text-muted); margin-bottom: 8px; display: flex; justify-content: space-between; }

    .bay-frame {
      background: var(--bg-root); border: 1px solid var(--ecs-primary-dark);
      border-radius: 10px; padding: 12px; position: relative;
    }
    .bay-grid { display: grid; grid-template-columns: repeat(11, 1fr); gap: 3px; }

    .pallet {
      border-radius: 4px; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 38px; overflow: hidden; cursor: default;
      transition: transform 0.12s, box-shadow 0.12s;
    }
    .pallet:hover { transform: scale(1.1); z-index: 5; box-shadow: 0 4px 12px rgba(0,0,0,.5); }
    .pallet-cl { font-size: 0.52rem; font-weight: 700; text-align: center; line-height: 1; }
    .pallet-wt { font-size: 0.45rem; opacity: .65; }

    .cargo-fmcg    { background: var(--ecs-primary); color: #ffc8d8; }
    .cargo-ambient { background: #0f3d20; color: #86efac; }
    .cargo-chilled { background: #0c2e45; color: #7dd3fc; }
    .cargo-frozen  { background: #1a0f4a; color: #c4b5fd; }

    .legend { display: flex; gap: 8px; margin-top: 10px; }
    .leg { font-size: 0.65rem; padding: 3px 10px; border-radius: 4px; font-weight: 600; }

    .unassigned {
      background: var(--status-warn-bg); border: 1px solid var(--ecs-accent-dark);
      border-radius: 8px; padding: 9px 14px; font-size: 0.78rem; color: var(--ecs-accent);
    }
    .ua-num { font-weight: 700; }

    .empty { text-align: center; padding: 48px 24px; }
    .empty-icon svg { width: 80px; height: 80px; margin: 0 auto 16px; display: block; }
    .empty-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .empty-sub { font-size: 0.78rem; color: var(--text-muted); line-height: 1.6; }
  `]
})
export class TrailerViewComponent {
  result: ConsolidationResult | null = null;
  loading = false;

  constructor(private api: ApiService) {}

  runDemo() {
    this.loading = true;
    this.api.runDemoOptimization().subscribe({
      next: r => { this.result = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  palletH(lp: LoadedPallet) { return Math.max(36, lp.pallet.heightCm * 0.27); }

  palletTip(lp: LoadedPallet) {
    return `${lp.pallet.client}\n${lp.pallet.weightKg}kg · ${lp.pallet.heightCm}cm · ${lp.pallet.cargoType}\nLaag ${lp.layer} pos ${lp.positionInLayer}`;
  }
}
