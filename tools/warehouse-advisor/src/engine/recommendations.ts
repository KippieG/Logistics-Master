import { WarehouseConfig, Recommendation } from '../types/warehouse'
import { detectBottlenecks } from './bottleneck'

export function generateRecommendations(wh: WarehouseConfig): Recommendation[] {
  const bottlenecks = detectBottlenecks(wh)
  const recs: Recommendation[] = []

  const hasCriticalPick = bottlenecks.some(b => b.zoneType === 'picking' && b.severity === 'critical')
  const hasHighUtil = wh.zones.some(z => z.currentUtilization >= 0.88)
  const hasLongTravel = wh.zones.some(z => z.travelDistance > 45)
  const hasFastMoverIssue = bottlenecks.some(b => b.id === 'bn-fastmover-layout')
  const hasPeakGap = bottlenecks.some(b => b.id === 'bn-peak-capacity')
  const pickingZone = wh.zones.find(z => z.type === 'picking')
  const storageB = wh.zones.find(z => z.id === 'z-storage-b')

  if (hasFastMoverIssue || wh.operations.fastMoverVolumePercent >= 65) {
    recs.push({
      id: 'rec-fastmover',
      category: 'layout',
      severity: 'critical',
      title: 'Relocate Fast-Moving SKUs to Golden Zone',
      description: `Move the top ${wh.operations.fastMoverPercent}% velocity SKUs (responsible for ${wh.operations.fastMoverVolumePercent}% of order volume) to Storage Zone A, directly adjacent to the picking area.`,
      rationale: `Current layout places high-velocity items up to ${storageB?.travelDistance ?? 58}m from picking. Travel time accounts for ~38% of total pick time. The "golden zone" principle places fast movers at waist height within 10m of pick stations.`,
      estimatedImpact: {
        throughputGain: 16,
        costReduction: 12,
        efficiencyGain: 18,
        paybackMonths: 2,
      },
      effort: 'medium',
      timelineWeeks: 3,
      relatedZones: ['z-storage-a', 'z-storage-b', 'z-picking'],
    })
  }

  if (hasCriticalPick) {
    recs.push({
      id: 'rec-split-picking',
      category: 'layout',
      severity: 'critical',
      title: 'Split Picking into A/B Zone System',
      description: 'Divide the picking zone into two dedicated sub-zones: Zone A for fast-movers (top 20% SKUs) and Zone B for slow-movers. Assign dedicated picking staff to each zone.',
      rationale: 'Mixing fast and slow movers in one picking zone creates congestion and forces pickers to travel longer routes. A/B zoning reduces zone traffic by 40% and allows zone-specific picking strategies (batch picking for B, single-order for A).',
      estimatedImpact: {
        throughputGain: 22,
        costReduction: 8,
        efficiencyGain: 25,
        paybackMonths: 4,
      },
      effort: 'high',
      timelineWeeks: 6,
      relatedZones: ['z-picking'],
    })
  }

  if (hasPeakGap) {
    recs.push({
      id: 'rec-flex-staff',
      category: 'staffing',
      severity: 'critical',
      title: 'Implement Flexible Peak-Season Staffing Model',
      description: `Create a flex workforce pool of ${Math.round(wh.staff.totalHeadcount * 0.3)} trained temporary workers to deploy during peak periods. Establish partnerships with 2–3 staffing agencies for rapid deployment within 48h.`,
      rationale: `Peak demand (${wh.operations.peakMultiplier}× average) exceeds current capacity. Maintaining permanent staff for peak wastes €${Math.round(wh.staff.totalHeadcount * 0.3 * 22.5 * 8 * 200)} per year in off-peak overstaffing.`,
      estimatedImpact: {
        throughputGain: 35,
        costReduction: 18,
        efficiencyGain: 28,
        paybackMonths: 6,
      },
      effort: 'medium',
      timelineWeeks: 8,
      relatedZones: ['z-picking', 'z-packing', 'z-receiving'],
    })
  }

  if (hasLongTravel) {
    recs.push({
      id: 'rec-pick-path',
      category: 'process',
      severity: 'warning',
      title: 'Optimise Pick Route with Wave Planning',
      description: 'Implement wave-based pick sequencing to group orders by zone proximity. Configure WMS to generate zone-optimized pick lists that reduce backtracking.',
      rationale: 'Current pick paths show an estimated 32% backtracking inefficiency. Wave planning with zone-sequenced pick lists can cut travel distance by 20–30% without any physical changes.',
      estimatedImpact: {
        throughputGain: 12,
        costReduction: 9,
        efficiencyGain: 15,
        paybackMonths: 1,
      },
      effort: 'low',
      timelineWeeks: 2,
      relatedZones: ['z-picking', 'z-storage-a', 'z-storage-b'],
    })
  }

  if (hasHighUtil) {
    recs.push({
      id: 'rec-crossdock',
      category: 'process',
      severity: 'warning',
      title: 'Enable Cross-Docking for High-Velocity Orders',
      description: 'For orders where inbound goods can be directly matched to outbound shipments, bypass storage entirely. Target top 30% order volume to reduce storage pressure.',
      rationale: `Storage Zone A is at ${Math.round((wh.zones.find(z => z.id === 'z-storage-a')?.currentUtilization ?? 0.88) * 100)}% utilisation. Cross-docking eliminates put-away and retrieval steps, cutting handling time by ~45% for matched orders.`,
      estimatedImpact: {
        throughputGain: 19,
        costReduction: 22,
        efficiencyGain: 17,
        paybackMonths: 5,
      },
      effort: 'high',
      timelineWeeks: 10,
      relatedZones: ['z-receiving', 'z-staging', 'z-shipping'],
    })
  }

  recs.push({
    id: 'rec-kpi-dashboard',
    category: 'technology',
    severity: 'info',
    title: 'Real-Time KPI Monitoring Dashboard',
    description: 'Implement digital KPI dashboards at zone entry points showing live throughput, utilisation, and queue depth. Use WMS API integration for automated data feeds.',
    rationale: 'Current performance visibility relies on end-of-shift reports. Real-time data enables supervisors to rebalance staff and address bottlenecks within minutes instead of hours.',
    estimatedImpact: {
      throughputGain: 7,
      costReduction: 5,
      efficiencyGain: 11,
      paybackMonths: 8,
    },
    effort: 'medium',
    timelineWeeks: 4,
    relatedZones: wh.zones.map(z => z.id),
  })

  recs.push({
    id: 'rec-slotting',
    category: 'inventory',
    severity: 'warning',
    title: 'Dynamic Slotting Optimisation',
    description: `Perform quarterly ABC/XYZ velocity analysis across ${wh.operations.skuCount.toLocaleString()} SKUs and reallocate storage slots accordingly. Automate slot assignments based on WMS pick frequency data.`,
    rationale: 'Static slot assignments become suboptimal as demand patterns change. Dynamic slotting keeps fast movers in optimal positions and reduces overall pick distance over time.',
    estimatedImpact: {
      throughputGain: 10,
      costReduction: 7,
      efficiencyGain: 13,
      paybackMonths: 3,
    },
    effort: 'low',
    timelineWeeks: 2,
    relatedZones: ['z-storage-a', 'z-storage-b'],
  })

  if (wh.operations.returnRate > 7) {
    recs.push({
      id: 'rec-returns',
      category: 'process',
      severity: 'warning',
      title: 'Streamline Returns Processing with Triage System',
      description: `Implement a 3-tier returns triage: (A) restock-ready, (B) requires QC, (C) disposal/refurb. Current ${wh.operations.returnRate}% return rate creates ${Math.round(wh.operations.dailyOrderVolume * wh.operations.returnRate / 100)} returns/day.`,
      rationale: 'Undifferentiated returns processing forces all items through full QC even when unnecessary. A triage system reduces average handling time per return by 35%.',
      estimatedImpact: {
        throughputGain: 5,
        costReduction: 14,
        efficiencyGain: 8,
        paybackMonths: 2,
      },
      effort: 'low',
      timelineWeeks: 3,
      relatedZones: ['z-returns'],
    })
  }

  const order: Record<string, number> = { critical: 0, warning: 1, info: 2, good: 3 }
  return recs.sort((a, b) => order[a.severity] - order[b.severity])
}
