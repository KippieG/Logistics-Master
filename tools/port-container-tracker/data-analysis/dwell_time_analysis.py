"""
dwell_time_analysis.py
----------------------
Analyses container dwell times from terminal data export.
Produces a daily alert report for the operations team.

Skills demonstrated:
  - pandas data manipulation
  - Statistical analysis (mean, percentiles, outlier detection)
  - Automated report generation
  - Clear, documented code for end-user handover
"""

import pandas as pd
import matplotlib.pyplot as plt
from datetime import date, timedelta
import os

# --- Config ---
SLA_DAYS = 5          # Dwell time SLA
CRITICAL_DAYS = 7     # Escalation threshold
OUTPUT_DIR = "reports"


def load_container_data(filepath: str) -> pd.DataFrame:
    """
    Load container data from CSV export.
    In production: replace with API call to TOS (e.g. Navis N4 REST endpoint).
    """
    df = pd.read_csv(filepath, parse_dates=['arrival_date', 'departure_date'])
    df['dwell_days'] = (pd.Timestamp(date.today()) - df['arrival_date']).dt.days
    df['in_yard'] = df['departure_date'].isna()
    return df[df['in_yard']].copy()


def analyse_dwell(df: pd.DataFrame) -> dict:
    """Calculate key dwell time statistics."""
    return {
        'total_containers': len(df),
        'avg_dwell': round(df['dwell_days'].mean(), 1),
        'median_dwell': round(df['dwell_days'].median(), 1),
        'p90_dwell': round(df['dwell_days'].quantile(0.9), 1),
        'sla_breaches': int((df['dwell_days'] > SLA_DAYS).sum()),
        'critical': int((df['dwell_days'] > CRITICAL_DAYS).sum()),
        'sla_breach_pct': round((df['dwell_days'] > SLA_DAYS).mean() * 100, 1)
    }


def get_alert_list(df: pd.DataFrame) -> pd.DataFrame:
    """Return containers exceeding SLA, sorted by severity."""
    alerts = df[df['dwell_days'] > SLA_DAYS].copy()
    alerts['severity'] = alerts['dwell_days'].apply(
        lambda d: 'CRITICAL' if d > CRITICAL_DAYS else 'WARNING'
    )
    return alerts[['container_id', 'size', 'yard_location', 'arrival_date',
                   'dwell_days', 'severity']].sort_values('dwell_days', ascending=False)


def plot_dwell_distribution(df: pd.DataFrame, output_path: str):
    """Generate dwell time histogram for the operations report."""
    fig, ax = plt.subplots(figsize=(10, 4))
    fig.patch.set_facecolor('#161b22')
    ax.set_facecolor('#161b22')

    ax.hist(df['dwell_days'], bins=20, color='#388bfd', alpha=0.8, edgecolor='#30363d')
    ax.axvline(SLA_DAYS, color='#f85149', linestyle='--', linewidth=1.5, label=f'SLA ({SLA_DAYS}d)')
    ax.axvline(df['dwell_days'].mean(), color='#3fb950', linestyle='--', linewidth=1.5,
               label=f"Avg ({df['dwell_days'].mean():.1f}d)")

    ax.set_xlabel('Dwell time (days)', color='#8b949e')
    ax.set_ylabel('Number of containers', color='#8b949e')
    ax.set_title('Container Dwell Time Distribution', color='#e6edf3', fontsize=13)
    ax.tick_params(colors='#8b949e')
    ax.legend(facecolor='#21262d', labelcolor='#e6edf3', edgecolor='#30363d')

    for spine in ax.spines.values():
        spine.set_edgecolor('#30363d')

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"  Chart saved: {output_path}")


def generate_report(stats: dict, alerts: pd.DataFrame):
    """Print daily dwell time report to console (and/or export to CSV/PDF)."""
    today = date.today().strftime('%Y-%m-%d')
    print(f"\n{'='*55}")
    print(f"  DWELL TIME REPORT — {today}")
    print(f"{'='*55}")
    print(f"  Total containers in yard : {stats['total_containers']}")
    print(f"  Average dwell time       : {stats['avg_dwell']} days")
    print(f"  90th percentile          : {stats['p90_dwell']} days")
    print(f"  SLA breaches (>{SLA_DAYS}d)    : {stats['sla_breaches']} ({stats['sla_breach_pct']}%)")
    print(f"  Critical (>{CRITICAL_DAYS}d)          : {stats['critical']}")
    print(f"{'='*55}\n")

    if not alerts.empty:
        print("  ALERT LIST:")
        print(alerts.to_string(index=False))
    else:
        print("  ✓ No dwell time alerts today.")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    alerts.to_csv(f"{OUTPUT_DIR}/dwell_alerts_{today}.csv", index=False)
    print(f"\n  Report saved to {OUTPUT_DIR}/dwell_alerts_{today}.csv")


def main():
    print("Port Container Tracker — Dwell Time Analysis")
    print("Generating report...\n")

    # --- Synthetic demo data (replace with real CSV/API in production) ---
    import numpy as np
    np.random.seed(42)
    n = 320
    arrivals = [date.today() - timedelta(days=int(d)) for d in np.random.exponential(3.8, n)]
    df = pd.DataFrame({
        'container_id': [f'DEMO{i:07d}' for i in range(n)],
        'size': np.random.choice(['20GP', '40GP', '40HC'], n, p=[0.3, 0.4, 0.3]),
        'yard_location': [f'{chr(65 + i%5)}-{(i%20)+1:02d}-{(i%12)+1:02d}' for i in range(n)],
        'arrival_date': pd.to_datetime(arrivals),
        'departure_date': pd.NaT
    })
    df['dwell_days'] = (pd.Timestamp(date.today()) - df['arrival_date']).dt.days
    df['in_yard'] = True
    # ---

    stats = analyse_dwell(df)
    alerts = get_alert_list(df)
    plot_dwell_distribution(df, f"{OUTPUT_DIR}/dwell_distribution.png")
    generate_report(stats, alerts)


if __name__ == '__main__':
    main()
