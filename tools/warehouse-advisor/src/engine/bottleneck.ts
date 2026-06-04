import { WarehouseConfig, Bottleneck, Severity } from '../types/warehouse'

function sev(val: number, warn: number, crit: number, inverted = false): Severity {
  if (inverted) {
    return val <= crit ? 'critical' : val <= warn ? 'warning' : 'good'
  }
  return val >= crit ? 'critical' : val >= warn ? 'warning' : 'good'
}

export function detectBottlenecks(wh: WarehouseConfig): Bottleneck[] {
  const bottlenecks: Bottleneck[] = []

  wh.zones.forEach(zone => {
    const util = zone.currentUtilization * 100

    // High utilisation
    if (util >= 85) {
      bottlenecks.push({
        id: `bn-util-${zone.id}`,
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.type,
        severity: sev(util, 85, 92),
        title: 'High Zone Utilisation',
        description: `${zone.name} is operating at ${util.toFixed(0)}% capacity, limiting buffer for demand spikes.`,
        metric: 'Zone Utilisation',
        value: util,
        threshold: 85,
        impact: util >= 92
          ? 'Risk of complete zone overflow during peak hours. Immediate action required.'
          : 'Reduced flexibility to absorb demand spikes. Plan capacity expansion.',
      })
    }

    // Throughput bottleneck (picking zone is the usual suspect)
    if (zone.type === 'picking' && zone.processingRate > 0) {
      const packZone = wh.zones.find(z => z.type === 'packing')
      if (packZone && zone.processingRate < packZone.processingRate * 0.9) {
        bottlenecks.push({
          id: `bn-pick-${zone.id}`,
          zoneId: zone.id,
          zoneName: zone.name,
          zoneType: zone.type,
          severity: 'critical',
          title: 'Picking–Packing Rate Mismatch',
          description: `Picking rate (${zone.processingRate} ord/h) is ${Math.round((1 - zone.processingRate / packZone.processingRate) * 100)}% slower than packing capacity (${packZone.processingRate} ord/h).`,
          metric: 'Processing Rate Delta',
          value: zone.processingRate,
          threshold: packZone.processingRate,
          impact: 'Packing team idles while waiting for picks. Estimated €280/shift in wasted labour.',
        })
      }
    }

    // Long travel distance
    if (zone.travelDistance > 45) {
      bottlenecks.push({
        id: `bn-travel-${zone.id}`,
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.type,
        severity: sev(zone.travelDistance, 45, 60),
        title: 'Excessive Travel Distance',
        description: `Average picker travel of ${zone.travelDistance}m between ${zone.name} and next zone exceeds optimal range (< 35m).`,
        metric: 'Avg Travel Distance (m)',
        value: zone.travelDistance,
        threshold: 45,
        impact: `~${Math.round((zone.travelDistance - 35) * 0.18)} min/picker/pick in wasted movement. At ${zone.staffAssigned} staff: ${Math.round((zone.travelDistance - 35) * 0.18 * zone.staffAssigned * 8)} min/day lost.`,
      })
    }

    // Returns overflow
    if (zone.type === 'returns' && util >= 75) {
      bottlenecks.push({
        id: `bn-returns-${zone.id}`,
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.type,
        severity: sev(util, 75, 88),
        title: 'Returns Zone Overloaded',
        description: `Returns processing area at ${util.toFixed(0)}% capacity. High return rate (${wh.operations.returnRate}%) is straining the zone.`,
        metric: 'Returns Zone Utilisation',
        value: util,
        threshold: 75,
        impact: 'Delayed return-to-stock reduces available inventory and increases customer refund processing times.',
      })
    }

    // Understaffed zone
    if (zone.processingRate > 0 && zone.staffAssigned < 3 && zone.type !== 'storage') {
      bottlenecks.push({
        id: `bn-staff-${zone.id}`,
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.type,
        severity: 'warning',
        title: 'Understaffed Zone',
        description: `${zone.name} has only ${zone.staffAssigned} staff, which may be insufficient during peak operations.`,
        metric: 'Staff Headcount',
        value: zone.staffAssigned,
        threshold: 3,
        impact: 'Single point of failure — any absence creates immediate throughput drop.',
      })
    }
  })

  // Peak demand gap
  const peakDemand = wh.operations.dailyOrderVolume * wh.operations.peakMultiplier / 16
  const pickZone = wh.zones.find(z => z.type === 'picking')
  if (pickZone && pickZone.processingRate < peakDemand) {
    bottlenecks.push({
      id: 'bn-peak-capacity',
      zoneId: pickZone.id,
      zoneName: 'Entire Warehouse',
      zoneType: 'picking',
      severity: 'critical',
      title: 'Insufficient Peak Capacity',
      description: `Peak demand forecast is ${Math.round(peakDemand)} orders/h but current max throughput is only ${pickZone.processingRate} orders/h.`,
      metric: 'Peak Orders/h',
      value: pickZone.processingRate,
      threshold: Math.round(peakDemand),
      impact: `Gap of ${Math.round(peakDemand - pickZone.processingRate)} orders/h means SLA breaches during peak. Estimated ${Math.round((peakDemand - pickZone.processingRate) * 16 * wh.operations.peakMultiplier)} unfulfilled orders per peak day.`,
    })
  }

  // Fast-mover SKUs too far from picking
  if (wh.operations.fastMoverVolumePercent >= 65) {
    const storageB = wh.zones.find(z => z.id === 'z-storage-b')
    const pickingZ = wh.zones.find(z => z.type === 'picking')
    if (storageB && pickingZ && storageB.travelDistance > pickingZ.travelDistance + 20) {
      bottlenecks.push({
        id: 'bn-fastmover-layout',
        zoneId: storageB.id,
        zoneName: 'Storage Layout',
        zoneType: 'storage',
        severity: 'warning',
        title: 'Fast-Mover SKU Positioning',
        description: `${wh.operations.fastMoverVolumePercent}% of order volume comes from ${wh.operations.fastMoverPercent}% of SKUs, yet many are stored in far zones.`,
        metric: 'Fast-Mover Travel Distance',
        value: storageB.travelDistance,
        threshold: 35,
        impact: 'Relocating top-velocity SKUs closer to picking could improve pick rate by an estimated 12–18%.',
      })
    }
  }

  // Sort: critical first, then warning
  return bottlenecks.sort((a, b) => {
    const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2, good: 3 }
    return order[a.severity] - order[b.severity]
  })
}
