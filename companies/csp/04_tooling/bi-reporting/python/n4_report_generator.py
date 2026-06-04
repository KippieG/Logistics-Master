"""
n4_report_generator.py
-----------------------
Automated daily KPI report for CSP Zeebrugge operations management.

In production this connects to the Oracle DWH via cx_Oracle.
Here we use synthetic data to demonstrate the full report pipeline:
  1. Pull data (DWH query / CSV export from N4)
  2. Calculate KPIs
  3. Generate charts
  4. Export daily CSV for BI tool ingestion

Run: python n4_report_generator.py
Output: reports/csp_daily_YYYY-MM-DD.csv + reports/charts/
"""

import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np
from datetime import date, timedelta
import os, json

# ── Config ─────────────────────────────────────────────────────────
OUTPUT_DIR  = 'reports'
CHART_DIR   = f'{OUTPUT_DIR}/charts'
SLA_DWELL   = 5    # days
SLA_GATE    = 45   # seconds
SLA_TURN    = 20   # vessel turnaround hours

DARK = '#0d1117'; SURFACE = '#161b22'; BORDER = '#30363d'
TEXT = '#e6edf3'; MUTED = '#8b949e'
ACCENT = '#388bfd'; GREEN = '#3fb950'; RED = '#f85149'; YELLOW = '#d29922'

# ── Synthetic data generator ────────────────────────────────────────
def generate_data(n_containers=400, n_gate=1200, n_vessels=5):
    np.random.seed(int(date.today().strftime('%j')))  # reproducible per day

    containers = pd.DataFrame({
        'container_id': [f'DEMO{i:07d}' for i in range(n_containers)],
        'direction':    np.random.choice(['IMPORT','EXPORT','TRANSSHIP'], n_containers, p=[.45,.45,.10]),
        'size':         np.random.choice(['20GP','40GP','40HC','40RF'], n_containers, p=[.25,.35,.30,.10]),
        'dwell_days':   np.random.exponential(3.8, n_containers).clip(0.5, 15),
        'yard_block':   [f'Block {chr(65+i%5)}' for i in range(n_containers)],
    })
    containers['sla_breach'] = containers['dwell_days'] > SLA_DWELL

    gate = pd.DataFrame({
        'hour':         np.random.choice(range(24), n_gate, p=[
            .005,.003,.001,.001,.001,.002,.008,.025,.045,.055,.052,.045,
            .042,.048,.052,.058,.055,.045,.035,.025,.018,.012,.008,.005]),
        'gate_seconds': np.random.lognormal(3.5, 0.4, n_gate).clip(15, 180),
        'outcome':      np.random.choice(['APPROVED','BLOCKED','NO_SHOW'], n_gate, p=[.962,.024,.014]),
        'direction':    np.random.choice(['IN','OUT'], n_gate),
    })

    vessels = pd.DataFrame({
        'vessel':       ['MSC Allegra','OOCL Hong Kong','Cosco Star','Evergreen Ever','CMA CGM Marco'],
        'carrier':      ['MSCU','OOLU','CSNU','EGLV','CMDU'],
        'turnaround_h': np.random.normal([18,22,15,20,17], 2, 5).clip(10, 35),
        'teu_moves':    np.random.randint(800, 2400, 5),
    })

    return containers, gate, vessels

# ── KPI calculation ─────────────────────────────────────────────────
def calc_kpis(containers, gate, vessels):
    return {
        'total_containers':  len(containers),
        'avg_dwell':         round(containers['dwell_days'].mean(), 1),
        'p90_dwell':         round(containers['dwell_days'].quantile(.9), 1),
        'sla_breach_count':  int(containers['sla_breach'].sum()),
        'sla_breach_pct':    round(containers['sla_breach'].mean() * 100, 1),
        'gate_total':        len(gate),
        'gate_approved_pct': round((gate['outcome']=='APPROVED').mean() * 100, 1),
        'gate_avg_seconds':  round(gate['gate_seconds'].mean(), 0),
        'gate_sla_miss_pct': round((gate['gate_seconds'] > SLA_GATE).mean() * 100, 1),
        'avg_turnaround_h':  round(vessels['turnaround_h'].mean(), 1),
        'turnaround_sla_miss': int((vessels['turnaround_h'] > SLA_TURN).sum()),
        'total_teu_moves':   int(vessels['teu_moves'].sum()),
    }

# ── Chart generation ────────────────────────────────────────────────
def apply_dark_style(fig, axes):
    fig.patch.set_facecolor(DARK)
    for ax in (axes if hasattr(axes, '__iter__') else [axes]):
        ax.set_facecolor(SURFACE)
        ax.tick_params(colors=MUTED)
        ax.xaxis.label.set_color(MUTED)
        ax.yaxis.label.set_color(MUTED)
        ax.title.set_color(TEXT)
        for spine in ax.spines.values():
            spine.set_edgecolor(BORDER)
        ax.grid(color=BORDER, linewidth=0.5)

def chart_dwell_distribution(containers, path):
    fig, ax = plt.subplots(figsize=(8, 3.5))
    ax.hist(containers['dwell_days'], bins=25, color=ACCENT, alpha=.8, edgecolor=BORDER)
    ax.axvline(SLA_DWELL, color=RED, lw=1.5, ls='--', label=f'SLA ({SLA_DWELL}d)')
    ax.axvline(containers['dwell_days'].mean(), color=GREEN, lw=1.5, ls='--',
               label=f"Avg ({containers['dwell_days'].mean():.1f}d)")
    ax.set_title('Container Dwell Time Distribution'); ax.set_xlabel('Days'); ax.set_ylabel('Containers')
    ax.legend(facecolor=SURFACE, labelcolor=TEXT, edgecolor=BORDER, fontsize=9)
    apply_dark_style(fig, ax)
    plt.tight_layout(); plt.savefig(path, dpi=150, facecolor=DARK); plt.close()

def chart_gate_hourly(gate, path):
    hourly = gate.groupby('hour').size()
    fig, ax = plt.subplots(figsize=(10, 3))
    bars = ax.bar(hourly.index, hourly.values, color=ACCENT, alpha=.8, width=0.7)
    # Highlight peak hours
    for i, bar in enumerate(bars):
        if hourly.values[i] == hourly.values.max():
            bar.set_color(RED)
    ax.set_title('Gate Transactions by Hour of Day')
    ax.set_xlabel('Hour'); ax.set_ylabel('Trucks')
    apply_dark_style(fig, ax)
    plt.tight_layout(); plt.savefig(path, dpi=150, facecolor=DARK); plt.close()

def chart_vessel_turnaround(vessels, path):
    colors = [RED if h > SLA_TURN else ACCENT for h in vessels['turnaround_h']]
    fig, ax = plt.subplots(figsize=(7, 3.5))
    bars = ax.barh(vessels['vessel'], vessels['turnaround_h'], color=colors, alpha=.85)
    ax.axvline(SLA_TURN, color=RED, lw=1.5, ls='--', label=f'SLA ({SLA_TURN}h)')
    ax.set_title('Vessel Turnaround Time'); ax.set_xlabel('Hours')
    ax.legend(facecolor=SURFACE, labelcolor=TEXT, edgecolor=BORDER, fontsize=9)
    apply_dark_style(fig, ax)
    plt.tight_layout(); plt.savefig(path, dpi=150, facecolor=DARK); plt.close()

# ── Main ────────────────────────────────────────────────────────────
def main():
    today = date.today().strftime('%Y-%m-%d')
    os.makedirs(CHART_DIR, exist_ok=True)

    print(f"CSP Zeebrugge — Daily KPI Report {today}")
    print("Generating...\n")

    containers, gate, vessels = generate_data()
    kpis = calc_kpis(containers, gate, vessels)

    # Print summary
    print(f"{'='*52}")
    print(f"  CONTAINER DWELL")
    print(f"  Total in yard       : {kpis['total_containers']}")
    print(f"  Avg dwell           : {kpis['avg_dwell']} days")
    print(f"  P90 dwell           : {kpis['p90_dwell']} days")
    print(f"  SLA breaches (>{SLA_DWELL}d)  : {kpis['sla_breach_count']} ({kpis['sla_breach_pct']}%)")
    print(f"\n  GATE OPERATIONS")
    print(f"  Total transactions  : {kpis['gate_total']}")
    print(f"  Approval rate       : {kpis['gate_approved_pct']}%")
    print(f"  Avg gate time       : {kpis['gate_avg_seconds']:.0f}s")
    print(f"  SLA misses (>{SLA_GATE}s)   : {kpis['gate_sla_miss_pct']}%")
    print(f"\n  VESSEL OPERATIONS")
    print(f"  Avg turnaround      : {kpis['avg_turnaround_h']}h")
    print(f"  Turnaround SLA miss : {kpis['turnaround_sla_miss']} vessels")
    print(f"  Total TEU moves     : {kpis['total_teu_moves']:,}")
    print(f"{'='*52}\n")

    # Generate charts
    chart_dwell_distribution(containers, f'{CHART_DIR}/dwell_{today}.png')
    chart_gate_hourly(gate, f'{CHART_DIR}/gate_hourly_{today}.png')
    chart_vessel_turnaround(vessels, f'{CHART_DIR}/turnaround_{today}.png')
    print(f"  Charts saved to {CHART_DIR}/")

    # Export dwell alerts to CSV (for BI tool ingestion)
    alerts = containers[containers['sla_breach']].copy()
    alerts['alert_level'] = alerts['dwell_days'].apply(
        lambda d: 'CRITICAL' if d > 7 else 'WARNING')
    alerts.to_csv(f'{OUTPUT_DIR}/dwell_alerts_{today}.csv', index=False)
    print(f"  Dwell alerts CSV: {OUTPUT_DIR}/dwell_alerts_{today}.csv")

    # Export KPI JSON (API endpoint simulation)
    with open(f'{OUTPUT_DIR}/kpis_{today}.json', 'w') as f:
        json.dump({**kpis, 'report_date': today}, f, indent=2)
    print(f"  KPI JSON: {OUTPUT_DIR}/kpis_{today}.json")
    print("\nDone.")

if __name__ == '__main__':
    main()
