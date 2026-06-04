import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../shared/services/api.service';
import { SignalRService } from '../shared/services/signalr.service';
import { ReeferContainer, CriticalAlert } from '../shared/models/reefer.model';

@Component({
  selector: 'app-reefer-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-header">
        <div>
          <h2 class="section-title">Koelcontainer Monitoring</h2>
          <p class="section-sub">{{ reefers.length }} containers · live telemetrie via SignalR</p>
        </div>
        <span class="live-pill">● LIVE</span>
      </div>

      <div *ngFor="let alert of alerts" class="crit-alert">
        <span class="crit-icon">⚠</span>
        <span>{{ alert.message }}</span>
      </div>

      <div class="reefer-grid">
        <div *ngFor="let r of reefers" class="reefer-card" [class]="getCardClass(r)">
          <div class="card-top">
            <span class="cnum">{{ r.containerNumber }}</span>
            <span class="status-pill" [class]="getPillClass(r)">{{ statusLabel(r.status) }}</span>
          </div>
          <div class="card-client">{{ r.client }} <span class="arrow">→</span> {{ r.destination }}</div>

          <div class="temp-block">
            <div class="temp-val" [class.temp-bad]="r.isOutOfRange">
              {{ r.currentTemp | number:'1.1-1' }}<span class="temp-unit">°C</span>
            </div>
            <div class="temp-target">Doel: {{ r.targetTempMin }}° – {{ r.targetTempMax }}°C</div>
          </div>

          <div class="bar-wrap">
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="getBarPct(r)" [class]="getBarClass(r)"></div>
            </div>
          </div>

          <div class="card-bottom">
            <span *ngIf="r.isOutOfRange" class="deviation">
              ↑ {{ r.deviationCelsius | number:'1.1-1' }}°C afwijking
            </span>
            <span *ngIf="!r.isOutOfRange" class="ok-text">Binnen bereik</span>
            <span class="ts">{{ r.lastReading | date:'HH:mm:ss' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .section-sub { font-size: 0.68rem; color: var(--text-muted); margin-top: 2px; }
    .live-pill { font-size: 0.68rem; color: var(--status-ok); animation: pulse 1.5s infinite; font-weight: 600; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

    .crit-alert {
      display: flex; align-items: center; gap: 8px;
      background: var(--status-crit-bg); border: 1px solid var(--status-crit);
      border-radius: 8px; padding: 10px 14px; margin-bottom: 10px;
      font-size: 0.8rem; color: #fca5a5;
    }
    .crit-icon { color: var(--status-crit); font-size: 1rem; }

    .reefer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; }

    .reefer-card {
      background: var(--bg-card-2); border: 1px solid var(--bg-border);
      border-radius: 12px; padding: 14px; transition: border-color 0.3s;
    }
    .reefer-card.card-critical { border-color: var(--status-crit); background: var(--status-crit-bg); }
    .reefer-card.card-warning  { border-color: var(--status-warn); }
    .reefer-card.card-normal   { border-color: var(--bg-border); }

    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .cnum { font-size: 0.68rem; font-weight: 700; color: var(--text-muted); font-family: monospace; }

    .status-pill { font-size: 0.62rem; padding: 2px 8px; border-radius: 99px; font-weight: 700; }
    .pill-normal   { background: var(--status-ok-bg); color: var(--status-ok); }
    .pill-warning  { background: var(--status-warn-bg); color: var(--status-warn); }
    .pill-critical { background: var(--status-crit-bg); color: var(--status-crit); animation: pulse 1s infinite; }

    .card-client { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px; }
    .arrow { color: var(--text-muted); }

    .temp-block { text-align: center; margin-bottom: 8px; }
    .temp-val { font-size: 2.2rem; font-weight: 800; color: var(--ecs-accent); transition: color 0.3s; }
    .temp-val.temp-bad { color: var(--status-crit); }
    .temp-unit { font-size: 1rem; font-weight: 400; }
    .temp-target { font-size: 0.65rem; color: var(--text-muted); margin-top: 2px; }

    .bar-wrap { margin-bottom: 10px; }
    .bar-track { height: 4px; background: var(--bg-root); border-radius: 2px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
    .bar-normal   { background: var(--status-ok); }
    .bar-warning  { background: var(--status-warn); }
    .bar-critical { background: var(--status-crit); }

    .card-bottom { display: flex; justify-content: space-between; align-items: center; }
    .deviation { font-size: 0.68rem; color: var(--status-crit); }
    .ok-text { font-size: 0.68rem; color: var(--status-ok); }
    .ts { font-size: 0.62rem; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  `]
})
export class ReeferMonitorComponent implements OnInit, OnDestroy {
  @Output() criticalCountChange = new EventEmitter<number>();

  reefers: ReeferContainer[] = [];
  alerts: CriticalAlert[] = [];
  private subs: Subscription[] = [];

  constructor(private api: ApiService, private signalr: SignalRService) {}

  async ngOnInit() {
    this.api.getReefers().subscribe(data => {
      this.reefers = data;
      data.forEach(r => this.signalr.subscribeToReefer(r.id));
    });

    this.subs.push(
      this.signalr.temperatureUpdate$.subscribe(u => {
        const r = this.reefers.find(x => x.id === u.id);
        if (r) {
          r.currentTemp = u.currentTemp;
          r.status = u.status;
          r.deviationCelsius = u.deviationCelsius;
          r.isOutOfRange = u.deviationCelsius > 0;
          r.lastReading = u.timestamp;
          this.emitCritical();
        }
      }),
      this.signalr.criticalAlert$.subscribe(alert => {
        this.alerts.unshift(alert);
        if (this.alerts.length > 2) this.alerts.pop();
        setTimeout(() => { this.alerts = this.alerts.filter(a => a !== alert); }, 8000);
      })
    );
  }

  private emitCritical() {
    this.criticalCountChange.emit(this.reefers.filter(r => r.status === 'Critical').length);
  }

  getCardClass(r: ReeferContainer) {
    return `card-${r.status.toLowerCase()}`;
  }

  getPillClass(r: ReeferContainer) {
    return `pill-${r.status.toLowerCase()}`;
  }

  statusLabel(s: string) {
    return ({ Normal: 'Normaal', Warning: 'Waarschuwing', Critical: 'Kritiek', Offline: 'Offline' } as any)[s] ?? s;
  }

  getBarPct(r: ReeferContainer) {
    const span = Math.abs(r.targetTempMax - r.targetTempMin) * 2.5;
    return Math.min(100, Math.max(4, ((r.currentTemp - r.targetTempMin + span * 0.2) / (span * 1.4)) * 100));
  }

  getBarClass(r: ReeferContainer) {
    return `bar-${r.status.toLowerCase()}`;
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
