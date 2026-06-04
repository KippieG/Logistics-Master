import { WarehouseConfig, SimulationScenario, ScenarioResult } from '../types/warehouse'
import { calcThroughput, calcAvgZoneUtilization, calcCostPerOrder } from './calculations'
import { detectBottlenecks } from './bottleneck'

export function runScenario(wh: WarehouseConfig, scenario: SimulationScenario): ScenarioResult {
  const m = scenario.modifications

  // Deep clone config
  const modified: WarehouseConfig = JSON.parse(JSON.stringify(wh))

  // Apply modifications
  if (m.orderVolumeMultiplier) {
    modified.operations.dailyOrderVolume = Math.round(wh.operations.dailyOrderVolume * m.orderVolumeMultiplier)
  }

  if (m.staffMultiplier) {
    modified.staff.totalHeadcount = Math.round(wh.staff.totalHeadcount * m.staffMultiplier)
    modified.staff.pickersPerShift = Math.round(wh.staff.pickersPerShift * m.staffMultiplier)
    modified.staff.packersPerShift = Math.round(wh.staff.packersPerShift * m.staffMultiplier)
    modified.zones = modified.zones.map(z => {
      if (z.type === 'picking' || z.type === 'packing') {
        return {
          ...z,
          staffAssigned: Math.round(z.staffAssigned * m.staffMultiplier!),
          processingRate: Math.round(z.processingRate * m.staffMultiplier!),
          currentUtilization: Math.max(0.3, z.currentUtilization / m.staffMultiplier!),
        }
      }
      return z
    })
  }

  if (m.fastMoverReorganized) {
    modified.zones = modified.zones.map(z => {
      if (z.type === 'picking') return { ...z, travelDistance: Math.round(z.travelDistance * 0.62), processingRate: Math.round(z.processingRate * 1.18), currentUtilization: z.currentUtilization * 0.82 }
      if (z.id === 'z-storage-a') return { ...z, currentUtilization: Math.min(0.98, z.currentUtilization + 0.06) }
      if (z.id === 'z-storage-b') return { ...z, currentUtilization: Math.max(0.3, z.currentUtilization - 0.15), travelDistance: z.travelDistance }
      return z
    })
  }

  if (m.layoutOptimized) {
    modified.zones = modified.zones.map(z => ({
      ...z,
      travelDistance: Math.round(z.travelDistance * 0.78),
    }))
  }

  if (m.crossDockingEnabled) {
    const crossDockVolume = 0.30
    modified.zones = modified.zones.map(z => {
      if (z.type === 'receiving') return { ...z, processingRate: Math.round(z.processingRate * 1.12) }
      if (z.type === 'storage') return { ...z, currentUtilization: z.currentUtilization * (1 - crossDockVolume * 0.5) }
      if (z.type === 'shipping') return { ...z, processingRate: Math.round(z.processingRate * 1.08) }
      return z
    })
    modified.operations.dailyOrderVolume = Math.round(modified.operations.dailyOrderVolume * 1.08)
  }

  if (m.addAutomation) {
    modified.zones = modified.zones.map(z => {
      if (z.type === 'picking') return { ...z, processingRate: Math.round(z.processingRate * 1.35), currentUtilization: z.currentUtilization * 0.75 }
      if (z.type === 'packing') return { ...z, processingRate: Math.round(z.processingRate * 1.4), currentUtilization: z.currentUtilization * 0.7 }
      return z
    })
  }

  if (m.addPickingZone) {
    modified.zones = modified.zones.map(z => {
      if (z.type === 'picking') return {
        ...z,
        processingRate: Math.round(z.processingRate * 1.28),
        currentUtilization: z.currentUtilization * 0.62,
        area: Math.round(z.area * 1.1),
      }
      return z
    })
  }

  // Calculate results
  const baseThroughput = calcThroughput(wh)
  const modThroughput = calcThroughput(modified)
  const baseUtil = calcAvgZoneUtilization(wh)
  const modUtil = calcAvgZoneUtilization(modified)
  const baseCost = calcCostPerOrder(wh)
  const modCost = calcCostPerOrder(modified)
  const baseBottlenecks = detectBottlenecks(wh)
  const modBottlenecks = detectBottlenecks(modified)

  const baseLeadTime = 3.2 + (baseUtil * 2.8)
  const modLeadTime = 3.2 + (modUtil * 2.8)

  const baseEfficiency = Math.round((baseThroughput / Math.max(...wh.zones.filter(z => z.processingRate > 0).map(z => z.processingRate))) * 100)
  const modEfficiency = Math.min(99, Math.round((modThroughput / Math.max(...modified.zones.filter(z => z.processingRate > 0).map(z => z.processingRate))) * 100))

  const criticalWeight = 3, warningWeight = 1
  const baseScore = Math.min(100, baseBottlenecks.reduce((s, b) => s + (b.severity === 'critical' ? criticalWeight : warningWeight), 0) * 8)
  const modScore = Math.min(100, modBottlenecks.reduce((s, b) => s + (b.severity === 'critical' ? criticalWeight : warningWeight), 0) * 8)

  return {
    label: scenario.name,
    throughput: modThroughput,
    efficiency: modEfficiency,
    leadTime: Math.round(modLeadTime * 10) / 10,
    costPerOrder: Math.round(modCost * 100) / 100,
    utilization: Math.round(modUtil * 100),
    bottleneckScore: modScore,
  }
}

export function getBaseline(wh: WarehouseConfig): ScenarioResult {
  const throughput = calcThroughput(wh)
  const util = calcAvgZoneUtilization(wh)
  const cost = calcCostPerOrder(wh)
  const bottlenecks = detectBottlenecks(wh)
  const maxRate = Math.max(...wh.zones.filter(z => z.processingRate > 0).map(z => z.processingRate))
  const efficiency = Math.round((throughput / maxRate) * 100)
  const leadTime = 3.2 + (util * 2.8)
  const criticalWeight = 3, warningWeight = 1
  const bScore = Math.min(100, bottlenecks.reduce((s, b) => s + (b.severity === 'critical' ? criticalWeight : warningWeight), 0) * 8)

  return {
    label: 'Current Baseline',
    throughput,
    efficiency,
    leadTime: Math.round(leadTime * 10) / 10,
    costPerOrder: Math.round(cost * 100) / 100,
    utilization: Math.round(util * 100),
    bottleneckScore: bScore,
  }
}
