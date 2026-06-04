export interface HourlyMetric {
  hour: string;
  avgWait: number;
  trucks: number;
  deadTimeMin: number;
  congestion: number;
}

export interface WeekTrendData {
  day: string;
  avgWait: number;
  trucks: number;
  deadTimeHours: number;
  score: number;
}

export interface DeadTimeCategory {
  name: string;
  minutes: number;
  pct: number;
  color: string;
}

export interface ContractorStats {
  id: string;
  name: string;
  avgWait: number;
  trucks: number;
  onTimeRate: number;
  deadTimeHours: number;
  costImpact: number;
  score: number;
  trend: 'improving' | 'stable' | 'worsening';
  shift: string;
}

export interface LaneHourData {
  lane: number;
  hour: number;
  congestion: number;
}

export interface TruckEvent {
  id: string;
  plate: string;
  gate: string;
  lane: string;
  contractor: string;
  arrived: string;
  gateCleared: string;
  exitTime: string;
  waitMin: number;
  status: 'completed' | 'waiting' | 'delayed';
}

export interface Bottleneck {
  id: string;
  location: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  waitMinutes: number;
  affectedTrucks: number;
  since: string;
}

export interface ShiftStats {
  shift: string;
  label: string;
  avgWait: number;
  trucks: number;
  score: number;
  color: string;
}

export interface AiInsight {
  id: string;
  type: 'saving' | 'warning' | 'pattern';
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

export interface Kpis {
  avgWaitMin: number;
  avgWaitDelta: number;
  deadTimeHours: number;
  deadTimeDelta: number;
  costToday: number;
  costDelta: number;
  trucksProcessed: number;
  trucksDelta: number;
  efficiencyScore: number;
  efficiencyDelta: number;
}
