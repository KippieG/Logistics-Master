import { WarehouseConfig, KPI, Severity, ThroughputDataPoint } from '../types/warehouse'

export function getSeverity(value: number, thresholds: { warning: number; critical: number }, inverted = false): Severity {
  if (inverted) {
    if (value <= thresholds.critical) return 'critical'
    if (value <= thresholds.warning) return 'warning'
    return 'good'
  }
  if (value >= thresholds.critical) return 'critical'
  if (value >= thresholds.warning) return 'warning'
  return 'good'
}

export function calcOverallEfficiency(wh: WarehouseConfig): number {
  const zones = wh.zones.filter(z => z.processingRate > 0)
  if (zones.length === 0) return 0
  const minRate = Math.min(...zones.map(z => z.processingRate))
  const maxRate = Math.max(...zones.map(z => z.processingRate))
  const bottleneckRatio = minRate / maxRate
  const avgUtil = wh.zones.reduce((s, z) => s + z.currentUtilization, 0) / wh.zones.length
  const utilScore = 1 - Math.abs(avgUtil - 0.75) * 2
  return Math.round((bottleneckRatio * 0.5 + utilScore * 0.5) * 100)
}

export function calcThroughput(wh: WarehouseConfig): number {
  const activeZones = wh.zones.filter(z => z.processingRate > 0)
  if (activeZones.length === 0) return 0
  return Math.min(...activeZones.map(z => z.processingRate))
}

export function calcTotalTravelDistance(wh: WarehouseConfig): number {
  return wh.zones.reduce((sum, z) => sum + z.travelDistance, 0)
}

export function calcAvgZoneUtilization(wh: WarehouseConfig): number {
  return wh.zones.reduce((s, z) => s + z.currentUtilization, 0) / wh.zones.length
}

export function calcOrdersPerHour(wh: WarehouseConfig): number {
  return calcThroughput(wh)
}

export function calcCostPerOrder(wh: WarehouseConfig): number {
  const hourlyLabourCost = wh.staff.totalHeadcount * 22.5
  const ordersPerHour = calcOrdersPerHour(wh)
  if (ordersPerHour === 0) return 0
  return Math.round((hourlyLabourCost / ordersPerHour) * 100) / 100
}

export function calcPeakCapacityGap(wh: WarehouseConfig): number {
  const peakDemand = wh.operations.dailyOrderVolume * wh.operations.peakMultiplier / 16
  const currentCapacity = calcThroughput(wh)
  return Math.round(((currentCapacity - peakDemand) / peakDemand) * 100)
}

export function calcSpaceUtilizationScore(wh: WarehouseConfig): number {
  const usedArea = wh.zones.reduce((s, z) => s + z.area * z.currentUtilization, 0)
  return Math.round((usedArea / wh.totalArea) * 100)
}

export function buildKPIs(wh: WarehouseConfig): KPI[] {
  const efficiency = calcOverallEfficiency(wh)
  const throughput = calcOrdersPerHour(wh)
  const avgUtil = calcAvgZoneUtilization(wh)
  const costPerOrder = calcCostPerOrder(wh)
  const peakGap = calcPeakCapacityGap(wh)
  const travel = calcTotalTravelDistance(wh)
  const pickZone = wh.zones.find(z => z.type === 'picking')
  const pickUtil = pickZone ? pickZone.currentUtilization * 100 : 0

  return [
    {
      id: 'kpi-efficiency',
      label: 'Warehouse Efficiency',
      value: efficiency,
      unit: '%',
      trend: -3.2,
      status: getSeverity(efficiency, { warning: 60, critical: 40 }, true),
      description: 'Overall operational efficiency based on throughput balance and zone utilisation',
    },
    {
      id: 'kpi-throughput',
      label: 'Order Throughput',
      value: throughput,
      unit: 'orders/h',
      trend: 1.8,
      status: getSeverity(throughput, { warning: 120, critical: 80 }, true),
      description: 'Current throughput rate limited by bottleneck zone',
    },
    {
      id: 'kpi-utilization',
      label: 'Avg Zone Utilisation',
      value: Math.round(avgUtil * 100),
      unit: '%',
      trend: 4.1,
      status: getSeverity(avgUtil * 100, { warning: 85, critical: 95 }),
      description: 'Average utilisation across all warehouse zones',
    },
    {
      id: 'kpi-cost',
      label: 'Cost per Order',
      value: costPerOrder,
      unit: '€',
      trend: 2.3,
      status: getSeverity(costPerOrder, { warning: 5.5, critical: 8 }),
      description: 'Fully loaded labour cost per processed order',
    },
    {
      id: 'kpi-peak',
      label: 'Peak Capacity Gap',
      value: peakGap,
      unit: '%',
      trend: -1.5,
      status: peakGap < 0 ? 'critical' : peakGap < 20 ? 'warning' : 'good',
      description: 'Headroom between current capacity and peak demand forecast',
    },
    {
      id: 'kpi-pick',
      label: 'Picking Zone Load',
      value: Math.round(pickUtil),
      unit: '%',
      trend: 5.7,
      status: getSeverity(pickUtil, { warning: 85, critical: 92 }),
      description: 'Utilisation of picking zone — main bottleneck indicator',
    },
  ]
}

export function buildThroughputChart(wh: WarehouseConfig): ThroughputDataPoint[] {
  const capacity = calcThroughput(wh) * 1.2
  const target = wh.operations.dailyOrderVolume / 16
  return Array.from({ length: 16 }, (_, i) => {
    const hour = (6 + i).toString().padStart(2, '0') + ':00'
    const peak = i >= 3 && i <= 8 ? 1.2 : i >= 9 && i <= 13 ? 1.05 : 0.7
    const noise = (Math.random() - 0.5) * 15
    const actual = Math.round(capacity * 0.75 * peak + noise)
    return { hour, actual: Math.max(0, actual), capacity: Math.round(capacity), target: Math.round(target) }
  })
}
