import type {
  HourlyMetric, ContractorStats, LaneHourData,
  TruckEvent, Bottleneck, ShiftStats, AiInsight, Kpis,
  WeekTrendData, DeadTimeCategory,
} from '../types';

export const kpis: Kpis = {
  avgWaitMin: 34,
  avgWaitDelta: +12,
  deadTimeHours: 847,
  deadTimeDelta: +8,
  costToday: 127050,
  costDelta: +14,
  trucksProcessed: 1247,
  trucksDelta: +3,
  efficiencyScore: 63,
  efficiencyDelta: -4,
};

export const hourlyData: HourlyMetric[] = [
  { hour: '00:00', avgWait: 12, trucks: 23,  deadTimeMin: 276,  congestion: 15 },
  { hour: '01:00', avgWait: 8,  trucks: 18,  deadTimeMin: 144,  congestion: 10 },
  { hour: '02:00', avgWait: 7,  trucks: 14,  deadTimeMin: 98,   congestion: 8  },
  { hour: '03:00', avgWait: 9,  trucks: 11,  deadTimeMin: 99,   congestion: 10 },
  { hour: '04:00', avgWait: 11, trucks: 16,  deadTimeMin: 176,  congestion: 13 },
  { hour: '05:00', avgWait: 18, trucks: 34,  deadTimeMin: 612,  congestion: 23 },
  { hour: '06:00', avgWait: 38, trucks: 67,  deadTimeMin: 2546, congestion: 56 },
  { hour: '07:00', avgWait: 54, trucks: 89,  deadTimeMin: 4806, congestion: 82 },
  { hour: '08:00', avgWait: 61, trucks: 94,  deadTimeMin: 5734, congestion: 91 },
  { hour: '09:00', avgWait: 58, trucks: 88,  deadTimeMin: 5104, congestion: 87 },
  { hour: '10:00', avgWait: 47, trucks: 76,  deadTimeMin: 3572, congestion: 70 },
  { hour: '11:00', avgWait: 39, trucks: 71,  deadTimeMin: 2769, congestion: 60 },
  { hour: '12:00', avgWait: 33, trucks: 64,  deadTimeMin: 2112, congestion: 51 },
  { hour: '13:00', avgWait: 31, trucks: 59,  deadTimeMin: 1829, congestion: 47 },
  { hour: '14:00', avgWait: 44, trucks: 82,  deadTimeMin: 3608, congestion: 68 },
  { hour: '15:00', avgWait: 52, trucks: 91,  deadTimeMin: 4732, congestion: 79 },
  { hour: '16:00', avgWait: 57, trucks: 87,  deadTimeMin: 4959, congestion: 85 },
  { hour: '17:00', avgWait: 49, trucks: 79,  deadTimeMin: 3871, congestion: 73 },
  { hour: '18:00', avgWait: 38, trucks: 62,  deadTimeMin: 2356, congestion: 58 },
  { hour: '19:00', avgWait: 29, trucks: 48,  deadTimeMin: 1392, congestion: 43 },
  { hour: '20:00', avgWait: 22, trucks: 39,  deadTimeMin: 858,  congestion: 32 },
  { hour: '21:00', avgWait: 18, trucks: 31,  deadTimeMin: 558,  congestion: 25 },
  { hour: '22:00', avgWait: 14, trucks: 26,  deadTimeMin: 364,  congestion: 19 },
  { hour: '23:00', avgWait: 11, trucks: 21,  deadTimeMin: 231,  congestion: 14 },
];

export const weekTrendData: WeekTrendData[] = [
  { day: 'Ma', avgWait: 48, trucks: 198, deadTimeHours: 158, score: 55 },
  { day: 'Di', avgWait: 34, trucks: 187, deadTimeHours: 107, score: 68 },
  { day: 'Wo', avgWait: 31, trucks: 194, deadTimeHours: 100, score: 71 },
  { day: 'Do', avgWait: 36, trucks: 201, deadTimeHours: 121, score: 66 },
  { day: 'Vr', avgWait: 42, trucks: 219, deadTimeHours: 153, score: 59 },
  { day: 'Za', avgWait: 28, trucks: 124, deadTimeHours: 58,  score: 75 },
  { day: 'Zo', avgWait: 19, trucks: 89,  deadTimeHours: 28,  score: 84 },
];

export const deadTimeBreakdown: DeadTimeCategory[] = [
  { name: 'Gate congestion',       minutes: 18420, pct: 36, color: '#ef4444' },
  { name: 'Kraan stilstand',       minutes: 12750, pct: 25, color: '#f97316' },
  { name: 'Douane vertraging',     minutes: 10200, pct: 20, color: '#f59e0b' },
  { name: 'Shift overdracht',      minutes: 5100,  pct: 10, color: '#3b82f6' },
  { name: 'Documenten ontbrekend', minutes: 3060,  pct: 6,  color: '#8b5cf6' },
  { name: 'Overig',                minutes: 1530,  pct: 3,  color: '#6b7280' },
];

export const contractorStats: ContractorStats[] = [
  { id: 'c1', name: 'EuroTruck Zeebrugge',  avgWait: 22, trucks: 218, onTimeRate: 91, deadTimeHours: 79,  costImpact: 11850, score: 91, trend: 'improving', shift: 'Dag + Avond' },
  { id: 'c2', name: 'ZeeTrans BE',          avgWait: 29, trucks: 187, onTimeRate: 83, deadTimeHours: 91,  costImpact: 13650, score: 81, trend: 'stable',    shift: 'Dag' },
  { id: 'c3', name: 'LogisTrans NV',        avgWait: 34, trucks: 164, onTimeRate: 76, deadTimeHours: 93,  costImpact: 13950, score: 72, trend: 'stable',    shift: 'Avond + Nacht' },
  { id: 'c4', name: 'PortTruck Intl',       avgWait: 41, trucks: 142, onTimeRate: 69, deadTimeHours: 97,  costImpact: 14550, score: 62, trend: 'worsening', shift: 'Dag + Nacht' },
  { id: 'c5', name: 'be-FORWARD Logistics', avgWait: 48, trucks: 119, onTimeRate: 61, deadTimeHours: 95,  costImpact: 14250, score: 51, trend: 'worsening', shift: 'Dag' },
  { id: 'c6', name: 'Noord Cargo BV',       avgWait: 58, trucks: 98,  onTimeRate: 52, deadTimeHours: 95,  costImpact: 14250, score: 39, trend: 'worsening', shift: 'Nacht' },
];

function buildLaneHeatmap(): LaneHourData[] {
  const base = [10,8,6,7,9,20,45,68,78,72,58,48,40,38,52,61,65,55,42,32,24,18,14,11];
  const mul  = [0.9,1.0,0.85,1.1,1.2,0.88,0.95,1.25,0.75,1.05,1.15,0.7];
  const data: LaneHourData[] = [];
  for (let lane = 1; lane <= 12; lane++)
    for (let hour = 0; hour < 24; hour++)
      data.push({ lane, hour, congestion: Math.min(100, Math.round(base[hour] * mul[lane - 1])) });
  return data;
}
export const laneHeatmapData: LaneHourData[] = buildLaneHeatmap();

export const recentTrucks: TruckEvent[] = [
  { id: 'T001', plate: '1-BCE-847',    gate: 'Gate A', lane: 'Lane 7',  contractor: 'EuroTruck Zeebrugge',  arrived: '08:41', gateCleared: '09:38', exitTime: '10:02', waitMin: 57, status: 'completed' },
  { id: 'T002', plate: '2-KMN-391',    gate: 'Gate B', lane: 'Lane 3',  contractor: 'be-FORWARD Logistics', arrived: '09:12', gateCleared: '10:28', exitTime: '10:54', waitMin: 76, status: 'delayed'   },
  { id: 'T003', plate: '1-DPQ-562',    gate: 'Gate A', lane: 'Lane 8',  contractor: 'ZeeTrans BE',          arrived: '09:24', gateCleared: '09:58', exitTime: '10:21', waitMin: 34, status: 'completed' },
  { id: 'T004', plate: 'NL-81-BZK-4',  gate: 'Gate C', lane: 'Lane 11', contractor: 'Noord Cargo BV',       arrived: '09:31', gateCleared: '—',     exitTime: '—',     waitMin: 52, status: 'waiting'   },
  { id: 'T005', plate: '1-FGH-103',    gate: 'Gate A', lane: 'Lane 5',  contractor: 'LogisTrans NV',        arrived: '09:44', gateCleared: '10:19', exitTime: '10:41', waitMin: 35, status: 'completed' },
  { id: 'T006', plate: 'DE-K-ZB-9834', gate: 'Gate B', lane: 'Lane 2',  contractor: 'PortTruck Intl',       arrived: '09:51', gateCleared: '11:02', exitTime: '11:29', waitMin: 71, status: 'delayed'   },
  { id: 'T007', plate: '2-STU-748',    gate: 'Gate D', lane: 'Lane 10', contractor: 'EuroTruck Zeebrugge',  arrived: '10:03', gateCleared: '10:31', exitTime: '10:52', waitMin: 28, status: 'completed' },
  { id: 'T008', plate: '1-WXY-219',    gate: 'Gate A', lane: 'Lane 7',  contractor: 'be-FORWARD Logistics', arrived: '10:11', gateCleared: '—',     exitTime: '—',     waitMin: 38, status: 'waiting'   },
  { id: 'T009', plate: '1-ABR-330',    gate: 'Gate D', lane: 'Lane 12', contractor: 'LogisTrans NV',        arrived: '10:18', gateCleared: '10:52', exitTime: '11:09', waitMin: 34, status: 'completed' },
  { id: 'T010', plate: 'FR-59-ZB-471', gate: 'Gate B', lane: 'Lane 4',  contractor: 'ZeeTrans BE',          arrived: '10:22', gateCleared: '10:54', exitTime: '11:14', waitMin: 32, status: 'completed' },
  { id: 'T011', plate: '1-PKR-884',    gate: 'Gate C', lane: 'Lane 9',  contractor: 'Noord Cargo BV',       arrived: '10:29', gateCleared: '—',     exitTime: '—',     waitMin: 44, status: 'waiting'   },
  { id: 'T012', plate: '2-JLZ-017',    gate: 'Gate A', lane: 'Lane 6',  contractor: 'EuroTruck Zeebrugge',  arrived: '10:33', gateCleared: '11:01', exitTime: '11:18', waitMin: 28, status: 'completed' },
];

export const bottlenecks: Bottleneck[] = [
  { id: 'b1', location: 'Gate A — Lane 7/8', severity: 'critical', description: 'Kraan #3 defect — 14 trucks in wachtrij',      waitMinutes: 68, affectedTrucks: 14, since: '07:24' },
  { id: 'b2', location: 'Gate B — Douane',   severity: 'high',     description: 'Douane backlog HMRC-documenten, 8 pending',     waitMinutes: 44, affectedTrucks: 8,  since: '08:15' },
  { id: 'b3', location: 'Lane 11 — Gate C',  severity: 'medium',   description: 'ADR-vertraging gevaarlijke stoffen inspectie',  waitMinutes: 29, affectedTrucks: 4,  since: '09:02' },
];

export const shiftStats: ShiftStats[] = [
  { shift: 'day',     label: 'Dag (06:00–14:00)',   avgWait: 51, trucks: 498, score: 61, color: '#f59e0b' },
  { shift: 'evening', label: 'Avond (14:00–22:00)', avgWait: 43, trucks: 447, score: 68, color: '#3b82f6' },
  { shift: 'night',   label: 'Nacht (22:00–06:00)', avgWait: 12, trucks: 143, score: 87, color: '#8b5cf6' },
];

export const aiInsights: AiInsight[] = [
  {
    id: 'ai1', type: 'saving',
    title: 'Lane 7 & 8 routing optimalisatie',
    description: 'Gate A Lane 7/8 toont structureel 34% meer congestion tussen 07:00–10:00. Spreiding naar Lane 4-5 bespaart gemiddeld 19 minuten per truck in dat tijdslot.',
    impact: '€18.600 / week', confidence: 87,
  },
  {
    id: 'ai2', type: 'warning',
    title: 'Noord Cargo BV: prestaties in vrije val',
    description: 'Afgelopen 14 dagen: gemiddelde wachttijd +31% bij Noord Cargo BV. Patroon wijst op structureel dispatch-probleem. Aanbeveling: evaluatiegesprek vóór volgende weekshift.',
    impact: '−9 min/truck mogelijk', confidence: 91,
  },
  {
    id: 'ai3', type: 'pattern',
    title: 'Maandag ochtend piek is altijd voorspelbaar',
    description: 'Elke maandag 07:30–09:15 is congestion 28% hoger dan andere dagen — waarschijnlijk door weekend-ophoping. Extra poortcapaciteit op maandagochtend lost dit structureel op.',
    impact: '−22% wachttijd op maandag', confidence: 94,
  },
  {
    id: 'ai4', type: 'saving',
    title: 'Shiftwissel op 14:00 veroorzaakt 34 min stilstand',
    description: 'Bij elke shiftoverdracht staan trucks 34 min te wachten terwijl ze al aanwezig zijn. Een 15-min overlap in de overdrachtsprocedure elimineert dit volledig.',
    impact: '€8.400 / week', confidence: 83,
  },
];
