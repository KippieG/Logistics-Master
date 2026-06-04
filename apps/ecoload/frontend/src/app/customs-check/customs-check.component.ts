import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../shared/services/api.service';
import { Shipment } from '../shared/models/shipment.model';

@Component({
  selector: 'app-customs-check',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-header">
        <div>
          <h2 class="section-title">Brexit & Douane Status</h2>
          <p class="section-sub">Automatische documentvalidatie per UK-zending</p>
        </div>
        <div class="summary-pills">
          <span class="spill green">✓ {{ clearedCount }} vrijgegeven</span>
          <span class="spill red">✗ {{ blockedCount }} geblokkeerd</span>
        </div>
      </div>

      <div class="shipment-list">
        <div *ngFor="let s of shipments" class="shipment-card" [class]="'card-' + s.status.toLowerCase()">

          <div class="card-row">
            <div class="ship-left">
              <div class="ship-num">{{ s.shipmentNumber }}</div>
              <div class="ship-client">{{ s.client }}</div>
            </div>

            <div class="route-block">
              <span class="flag">{{ flag(s.originCountry) }}</span>
              <svg class="route-arrow" viewBox="0 0 20 8" fill="none">
                <path d="M0 4 H17 M13 1 L17 4 L13 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span class="flag">{{ flag(s.destinationCountry) }}</span>
              <span *ngIf="s.isUKBound" class="brexit-chip">BREXIT</span>
            </div>

            <div class="ship-meta">
              <span>{{ s.weightKg | number:'1.0-0' }} kg</span>
              <span>€{{ s.goodsValueEur | number:'1.0-0' }}</span>
            </div>

            <div class="status-col">
              <span class="status-pill" [class]="'pill-' + s.status.toLowerCase()">
                {{ statusLabel(s.status) }}
              </span>
            </div>
          </div>

          <div class="docs-row">
            <span *ngFor="let d of allDocs"
              class="doc-chip"
              [class.doc-ok]="hasDoc(s, d)"
              [class.doc-missing]="!hasDoc(s, d) && s.isUKBound">
              {{ d }}
            </span>
          </div>

          <div *ngIf="s.blockReasons.length > 0" class="reasons">
            <div *ngFor="let r of s.blockReasons" class="reason-row">
              <span class="reason-x">✗</span> {{ r }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .section-sub { font-size: 0.68rem; color: var(--text-muted); margin-top: 2px; }
    .summary-pills { display: flex; gap: 8px; }
    .spill { font-size: 0.72rem; padding: 4px 12px; border-radius: 99px; font-weight: 700; }
    .spill.green { background: var(--status-ok-bg); color: var(--status-ok); border: 1px solid #166534; }
    .spill.red   { background: var(--status-crit-bg); color: var(--status-crit); border: 1px solid #7f1d1d; }

    .shipment-list { display: flex; flex-direction: column; gap: 10px; }

    .shipment-card {
      background: var(--bg-card-2); border: 1px solid var(--bg-border);
      border-radius: 12px; padding: 14px 16px;
    }
    .shipment-card.card-cleared { border-color: #166534; }
    .shipment-card.card-blocked { border-color: var(--status-crit); background: var(--status-crit-bg); }

    .card-row { display: flex; align-items: center; gap: 16px; margin-bottom: 10px; }

    .ship-left { min-width: 130px; }
    .ship-num { font-size: 0.72rem; font-weight: 700; font-family: monospace; color: var(--ecs-accent); }
    .ship-client { font-size: 0.8rem; color: var(--text-primary); margin-top: 2px; }

    .route-block { display: flex; align-items: center; gap: 8px; }
    .flag { font-size: 1.1rem; }
    .route-arrow { width: 24px; color: var(--text-muted); }
    .brexit-chip {
      font-size: 0.58rem; font-weight: 800; letter-spacing: 1px;
      background: var(--ecs-primary); color: var(--ecs-accent);
      padding: 2px 6px; border-radius: 4px;
    }

    .ship-meta { display: flex; flex-direction: column; gap: 2px; margin-left: auto; }
    .ship-meta span { font-size: 0.7rem; color: var(--text-muted); }

    .status-col { min-width: 110px; text-align: right; }
    .status-pill { font-size: 0.7rem; padding: 4px 12px; border-radius: 99px; font-weight: 700; }
    .pill-cleared { background: var(--status-ok-bg); color: var(--status-ok); }
    .pill-blocked { background: var(--status-crit-bg); color: var(--status-crit); }
    .pill-pending { background: var(--status-warn-bg); color: var(--status-warn); }

    .docs-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .doc-chip { font-size: 0.62rem; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-weight: 600;
      background: var(--bg-root); color: var(--text-muted); border: 1px solid var(--bg-border); }
    .doc-ok { background: var(--status-ok-bg); color: var(--status-ok); border-color: #166534; }
    .doc-missing { background: var(--status-crit-bg); color: var(--status-crit); border-color: #7f1d1d; }

    .reasons { background: var(--bg-root); border-radius: 8px; padding: 8px 12px; }
    .reason-row { font-size: 0.73rem; color: #fca5a5; display: flex; gap: 8px; padding: 2px 0; }
    .reason-x { color: var(--status-crit); flex-shrink: 0; }
  `]
})
export class CustomsCheckComponent implements OnInit {
  @Output() blockedCountChange = new EventEmitter<number>();

  shipments: Shipment[] = [];
  readonly allDocs = ['EUR1', 'T1', 'CMR', 'PackingList', 'HealthCertificate'];

  get clearedCount() { return this.shipments.filter(s => s.status === 'Cleared').length; }
  get blockedCount()  { return this.shipments.filter(s => s.status === 'Blocked').length; }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getShipments().subscribe(data => {
      this.shipments = data;
      this.blockedCountChange.emit(this.blockedCount);
    });
  }

  hasDoc(s: Shipment, doc: string): boolean {
    return s.documents.includes(doc as any);
  }

  flag(code: string): string {
    return ({ BE: '🇧🇪', GB: '🇬🇧', NL: '🇳🇱', DE: '🇩🇪', FR: '🇫🇷' } as any)[code] ?? code;
  }

  statusLabel(s: string): string {
    return ({ Cleared: '✓ Vrijgegeven', Blocked: '✗ Geblokkeerd', Pending: '⏳ In behandeling' } as any)[s] ?? s;
  }
}
