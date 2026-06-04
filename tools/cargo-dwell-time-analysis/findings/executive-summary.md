# Executive Summary — Cargo Dwell Time Reduction
**Port of Zeebrugge · Q4 2024 · Philippe Godfroy**

## Problem
Average container dwell time: **6.4 days** — 38% above sector benchmark of 4.6 days.
Estimated annual demurrage cost: **€2.1M**

## Root Causes
| # | Cause | % of delays |
|---|-------|------------|
| 1 | Documentation delay (manual B/L) | 43% |
| 2 | Customs clearance backlog | 22% |
| 3 | Port congestion (Tue/Wed peak) | 15% |
| 4 | Late shipper pickup | 12% |
| 5 | Inspection required | 8% |

## Recommendations
1. **EDI integration** with Evergreen & MSC → −1.8 days avg dwell
2. **Automate B/L matching** → doc time 4.2h → 1.1h
3. **Redistribute arrival scheduling** → reduce Tue/Wed peak
4. **Mobile supervisor dashboard** → real-time intervention

## Expected Outcome
| KPI | Baseline | Target |
|-----|----------|--------|
| Avg dwell time | 6.4 days | 4.8 days |
| Containers >5d | 43% | 22% |
| Annual saving | — | €840K |

> Full analysis: [BRD.md](../BRD.md) · [UserStories.md](../UserStories.md) · [SQL queries](../sql/queries.sql)
