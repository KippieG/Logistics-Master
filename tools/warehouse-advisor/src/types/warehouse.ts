export type ZoneType = 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping' | 'staging' | 'returns'

export type Severity = 'critical' | 'warning' | 'info' | 'good'

export interface Zone {
  id: string
  name: string
  type: ZoneType
  area: number           // m²
  capacity: number       // max units/pallets
  currentUtilization: number // 0–1
  staffAssigned: number
  processingRate: number // orders per hour
  travelDistance: number // avg meters to next zone
  position: { x: number; y: number; w: number; h: number } // grid units
}

export interface StaffConfig {
  totalHeadcount: number
  shifts: number
  pickersPerShift: number
  packersPerShift: number
  receivingPerShift: number
  shippingPerShift: number
}

export interface OperationsConfig {
  dailyOrderVolume: number
  peakMultiplier: number       // peak vs avg ratio
  averageOrderLines: number    // lines per order
  skuCount: number
  fastMoverPercent: number     // % of SKUs = fast movers
  fastMoverVolumePercent: number // % of order volume from fast movers
  returnRate: number           // %
  avgPicksPerHour: number
  avgPacksPerHour: number
}

export interface WarehouseConfig {
  id: string
  name: string
  client: string
  location: string
  totalArea: number
  zones: Zone[]
  staff: StaffConfig
  operations: OperationsConfig
  createdAt: string
}

export interface KPI {
  id: string
  label: string
  value: number
  unit: string
  trend: number // % change
  status: Severity
  description: string
}

export interface Bottleneck {
  id: string
  zoneId: string
  zoneName: string
  zoneType: ZoneType
  severity: Severity
  title: string
  description: string
  metric: string
  value: number
  threshold: number
  impact: string
}

export interface Recommendation {
  id: string
  category: 'layout' | 'staffing' | 'process' | 'technology' | 'inventory'
  severity: Severity
  title: string
  description: string
  rationale: string
  estimatedImpact: {
    throughputGain: number   // %
    costReduction: number    // %
    efficiencyGain: number   // %
    paybackMonths: number
  }
  effort: 'low' | 'medium' | 'high'
  timelineWeeks: number
  relatedZones: string[]
}

export interface ScenarioResult {
  label: string
  throughput: number
  efficiency: number
  leadTime: number      // hours
  costPerOrder: number  // €
  utilization: number   // %
  bottleneckScore: number
}

export interface SimulationScenario {
  id: string
  name: string
  description: string
  icon: string
  modifications: Partial<{
    orderVolumeMultiplier: number
    staffMultiplier: number
    fastMoverReorganized: boolean
    addPickingZone: boolean
    addAutomation: boolean
    crossDockingEnabled: boolean
    layoutOptimized: boolean
  }>
}

export interface ThroughputDataPoint {
  hour: string
  actual: number
  capacity: number
  target: number
}

export interface ZoneFlowData {
  from: string
  to: string
  volume: number
}
