import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrailerViewComponent } from '../trailer-view/trailer-view.component';
import { ReeferMonitorComponent } from '../reefer-monitor/reefer-monitor.component';
import { CustomsCheckComponent } from '../customs-check/customs-check.component';
import { SignalRService } from '../shared/services/signalr.service';

type ActiveTab = 'trailer' | 'reefer' | 'customs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TrailerViewComponent, ReeferMonitorComponent, CustomsCheckComponent],
  template: `
    <div class="app-shell">

      <!-- ── HEADER ── -->
      <header class="header">
        <div class="header-brand">
          <svg class="brand-logo" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#8D1D45"/>
            <path d="M7 26 L18 10 L29 26" stroke="#F8CE3E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="13" y="22" width="10" height="4" rx="1" fill="#F8CE3E"/>
          </svg>
          <div>
            <div class="brand-name">ECS <span class="brand-thin">EcoLoad</span></div>
            <div class="brand-tagline">Supply Chain Intelligence · Zeebrugge</div>
          </div>
        </div>

        <nav class="tab-nav">
          <button class="tab" [class.tab-active]="tab==='trailer'" (click)="tab='trailer'">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM15 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M3 4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h.01M14 4H5a1 1 0 0 0-1 1v8h11V5a1 1 0 0 0-1-1zM14 4l2.5 6H18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1"/></svg>
            Lading Optimizer
          </button>
          <button class="tab" [class.tab-active]="tab==='reefer'" (click)="tab='reefer'">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 0 1 1 1v1.323l3.954 1.582 1.599-.8a1 1 0 0 1 .894 1.79l-1.233.616 1.738 5.42a1 1 0 0 1-.285 1.05A3.989 3.989 0 0 1 15 15a3.989 3.989 0 0 1-2.667-1.019 1 1 0 0 1-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 0 1-.285 1.05A3.989 3.989 0 0 1 5 15a3.989 3.989 0 0 1-2.667-1.019 1 1 0 0 1-.285-1.05l1.738-5.42-1.233-.617a1 1 0 0 1 .894-1.788l1.599.799L9 4.323V3a1 1 0 0 1 1-1z"/></svg>
            Koelcontainers
            <span class="tab-badge" *ngIf="criticalCount > 0">{{ criticalCount }}</span>
          </button>
          <button class="tab" [class.tab-active]="tab==='customs'" (click)="tab='customs'">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7z"/></svg>
            Brexit & Douane
            <span class="tab-badge tab-badge-warn" *ngIf="blockedCount > 0">{{ blockedCount }}</span>
          </button>
        </nav>

        <div class="header-right">
          <div class="live-indicator" [class.live]="connected">
            <span class="live-dot"></span>{{ connected ? 'Live' : 'Offline' }}
          </div>
          <div class="header-clock">{{ now | date:'HH:mm:ss' }}</div>
        </div>
      </header>

      <!-- ── KPI BAR ── -->
      <div class="kpi-bar">
        <div class="kpi">
          <div class="kpi-v">1.024</div>
          <div class="kpi-l">Koelcontainers actief</div>
        </div>
        <div class="kpi-sep"></div>
        <div class="kpi">
          <div class="kpi-v accent">98,2%</div>
          <div class="kpi-l">On-time delivery 48u UK</div>
        </div>
        <div class="kpi-sep"></div>
        <div class="kpi">
          <div class="kpi-v green">12.400 kg</div>
          <div class="kpi-l">CO₂ bespaard deze week</div>
        </div>
        <div class="kpi-sep"></div>
        <div class="kpi">
          <div class="kpi-v">47</div>
          <div class="kpi-l">Actieve UK-ritten</div>
        </div>
        <div class="kpi-sep"></div>
        <div class="kpi" [class.kpi-warn]="blockedCount > 0">
          <div class="kpi-v">{{ blockedCount }}</div>
          <div class="kpi-l">Douane geblokkeerd</div>
        </div>
      </div>

      <!-- ── CONTENT ── -->
      <main class="main">
        <div class="panel" [hidden]="tab !== 'trailer'">
          <app-trailer-view></app-trailer-view>
        </div>
        <div class="panel" [hidden]="tab !== 'reefer'">
          <app-reefer-monitor (criticalCountChange)="criticalCount = $event"></app-reefer-monitor>
        </div>
        <div class="panel" [hidden]="tab !== 'customs'">
          <app-customs-check (blockedCountChange)="blockedCount = $event"></app-customs-check>
        </div>
      </main>

      <!-- ── FOOTER ── -->
      <footer class="footer">
        <span>ECS European Containers nv · Baron de Maerelaan 155 · 8380 Zeebrugge · +32 50 50 20 20</span>
        <span class="footer-stack">.NET 10 · Angular 17 · SignalR · DDD · Docker</span>
      </footer>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg-root); }

    /* ── Header ── */
    .header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 28px;
      height: 62px;
      background: var(--bg-dark);
      border-bottom: 2px solid var(--ecs-primary-dark);
      position: sticky; top: 0; z-index: 100;
    }

    .header-brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 36px; height: 36px; flex-shrink: 0; }
    .brand-name { font-size: 1rem; font-weight: 800; color: var(--text-primary); letter-spacing: .5px; }
    .brand-thin { font-weight: 400; color: var(--text-secondary); }
    .brand-tagline { font-size: 0.62rem; color: var(--text-muted); margin-top: 1px; }

    .tab-nav { display: flex; gap: 2px; background: var(--bg-root); border: 1px solid var(--bg-border); border-radius: 10px; padding: 3px; }
    .tab {
      display: flex; align-items: center; gap: 6px;
      background: transparent; border: none; color: var(--text-muted);
      padding: 7px 16px; border-radius: 7px;
      cursor: pointer; font-size: 0.78rem; font-weight: 500;
      transition: all 0.15s; white-space: nowrap; font-family: inherit; position: relative;
    }
    .tab svg { width: 15px; height: 15px; flex-shrink: 0; }
    .tab:hover { color: var(--text-secondary); background: var(--bg-card); }
    .tab-active { background: var(--ecs-primary) !important; color: white !important; }
    .tab-badge {
      background: var(--status-crit); color: white; font-size: 0.6rem; font-weight: 700;
      min-width: 16px; height: 16px; border-radius: 99px;
      display: flex; align-items: center; justify-content: center; padding: 0 3px;
    }
    .tab-badge-warn { background: var(--ecs-accent); color: #000; }

    .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .live-indicator { display: flex; align-items: center; gap: 5px; font-size: 0.7rem; color: var(--status-crit); font-weight: 600; }
    .live-indicator.live { color: var(--status-ok); }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 1.4s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.25} }
    .header-clock { font-size: 1rem; font-weight: 700; color: var(--text-secondary); font-variant-numeric: tabular-nums; }

    /* ── KPI Bar ── */
    .kpi-bar {
      display: flex; align-items: center;
      background: var(--bg-dark); border-bottom: 1px solid var(--bg-border);
      padding: 10px 32px;
    }
    .kpi { flex: 1; text-align: center; }
    .kpi-v { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); }
    .kpi-v.accent { color: var(--ecs-accent); }
    .kpi-v.green { color: var(--status-ok); }
    .kpi-warn .kpi-v { color: var(--status-crit); }
    .kpi-l { font-size: 0.62rem; color: var(--text-muted); margin-top: 1px; text-transform: uppercase; letter-spacing: .5px; }
    .kpi-sep { width: 1px; background: var(--bg-border); height: 30px; margin: 0 4px; }

    /* ── Main ── */
    .main { flex: 1; padding: 24px 28px; }
    .panel {
      background: var(--bg-card);
      border: 1px solid var(--bg-border);
      border-radius: 16px;
      padding: 24px 28px;
    }

    /* ── Footer ── */
    .footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 28px; font-size: 0.62rem;
      color: var(--text-muted); border-top: 1px solid var(--bg-border);
      background: var(--bg-dark);
    }
    .footer-stack { color: var(--ecs-primary-dark); }

    @media (max-width: 960px) {
      .header { grid-template-columns: 1fr 1fr; height: auto; padding: 10px 16px; row-gap: 8px; }
      .tab-nav { grid-column: 1/-1; justify-content: center; }
      .tab { font-size: 0.72rem; padding: 6px 10px; }
      .kpi-bar { flex-wrap: wrap; gap: 10px; padding: 10px 16px; }
      .kpi-sep { display: none; }
      .main { padding: 14px 16px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  tab: ActiveTab = 'trailer';
  connected = false;
  criticalCount = 0;
  blockedCount = 0;
  now = new Date();

  constructor(private signalr: SignalRService) {}

  async ngOnInit() {
    await this.signalr.start();
    this.signalr.connected$.subscribe(s => this.connected = s);
    this.connected = true;
    setInterval(() => this.now = new Date(), 1000);
  }
}
