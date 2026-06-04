export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Shipment {
  id: string;
  client: string;
  origin: string;
  destination: string;
  route: string;
  carrier: string;
  eta: string;
  currentStatus: string;
  riskScore: number;
  riskLevel: RiskLevel;
  delayProbability: number;
  predictedDelay: number;
  delayFactors: DelayFactor[];
  containerType: string;
  weight: number;
  customsRequired: boolean;
  ferrySlot: string;
}

export interface DelayFactor {
  name: string;
  impact: number;
  category: 'weather' | 'customs' | 'capacity' | 'supplier' | 'ferry' | 'infrastructure';
}

export interface RouteStats {
  route: string;
  avgDelay: number;
  totalShipments: number;
  onTime: number;
  delayRate: number;
  riskScore: number;
}

export interface SupplierRisk {
  name: string;
  country: string;
  avgDelayDays: number;
  onTimeRate: number;
  totalShipments: number;
  riskScore: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface FerrySlot {
  slot: string;
  route: string;
  delayRate: number;
  avgDelay: number;
  capacity: number;
  fill: number;
}

export const shipments: Shipment[] = [
  {
    id: 'ECS-2024-7821',
    client: 'Tesco Distribution Ltd',
    origin: 'Felixstowe, UK',
    destination: 'Zeebrugge, BE',
    route: 'UK → BE',
    carrier: 'P&O Ferries',
    eta: '2024-06-03 06:30',
    currentStatus: 'At sea – Ferry EN Route',
    riskScore: 91,
    riskLevel: 'critical',
    delayProbability: 87,
    predictedDelay: 4.2,
    containerType: 'Reefer 40ft',
    weight: 22400,
    customsRequired: false,
    ferrySlot: 'Night – 02:00',
    delayFactors: [
      { name: 'North Sea weather alert', impact: 42, category: 'weather' },
      { name: 'P&O Zeebrugge berth congestion', impact: 28, category: 'capacity' },
      { name: 'Reefer inspection backlog', impact: 15, category: 'customs' },
      { name: 'Night slot low priority', impact: 6, category: 'ferry' },
    ],
  },
  {
    id: 'ECS-2024-7834',
    client: 'Lidl Belgium NV',
    origin: 'Zeebrugge, BE',
    destination: 'Tilbury, UK',
    route: 'BE → UK',
    carrier: 'DFDS Seaways',
    eta: '2024-06-03 14:00',
    currentStatus: 'Loaded – Awaiting departure',
    riskScore: 78,
    riskLevel: 'high',
    delayProbability: 72,
    predictedDelay: 2.8,
    containerType: 'Standard 40ft',
    weight: 18600,
    customsRequired: true,
    ferrySlot: 'Afternoon – 13:00',
    delayFactors: [
      { name: 'UK post-Brexit customs processing', impact: 38, category: 'customs' },
      { name: 'Tilbury port congestion', impact: 24, category: 'capacity' },
      { name: 'Missing customs documentation', impact: 10, category: 'customs' },
      { name: 'Driver shortage reported', impact: 6, category: 'infrastructure' },
    ],
  },
  {
    id: 'ECS-2024-7856',
    client: 'Amazon EU SARL',
    origin: 'Rotterdam, NL',
    destination: 'Zeebrugge, BE',
    route: 'NL → BE',
    carrier: 'ECS Road',
    eta: '2024-06-03 10:15',
    currentStatus: 'In transit – Road',
    riskScore: 64,
    riskLevel: 'high',
    delayProbability: 58,
    predictedDelay: 1.5,
    containerType: 'Standard 20ft',
    weight: 12400,
    customsRequired: false,
    ferrySlot: 'N/A',
    delayFactors: [
      { name: 'A16 traffic congestion', impact: 30, category: 'infrastructure' },
      { name: 'Supplier packing delay', impact: 22, category: 'supplier' },
      { name: 'Weigh station check', impact: 12, category: 'infrastructure' },
    ],
  },
  {
    id: 'ECS-2024-7867',
    client: 'Decathlon Group',
    origin: 'Zeebrugge, BE',
    destination: 'Hull, UK',
    route: 'BE → UK',
    carrier: 'P&O Ferries',
    eta: '2024-06-04 08:00',
    currentStatus: 'Warehouse – Pending loading',
    riskScore: 52,
    riskLevel: 'medium',
    delayProbability: 44,
    predictedDelay: 0.8,
    containerType: 'Standard 40ft',
    weight: 16200,
    customsRequired: true,
    ferrySlot: 'Morning – 22:00',
    delayFactors: [
      { name: 'Hull terminal maintenance window', impact: 28, category: 'capacity' },
      { name: 'Customs paperwork pending', impact: 16, category: 'customs' },
      { name: 'Weather forecast marginal', impact: 8, category: 'weather' },
    ],
  },
  {
    id: 'ECS-2024-7878',
    client: 'Carrefour Belgique',
    origin: 'Zeebrugge, BE',
    destination: 'Barcelona, ES',
    route: 'BE → ES',
    carrier: 'ECS Rail + Road',
    eta: '2024-06-05 16:30',
    currentStatus: 'Rail – On schedule',
    riskScore: 41,
    riskLevel: 'medium',
    delayProbability: 35,
    predictedDelay: 1.2,
    containerType: 'Reefer 40ft',
    weight: 24100,
    customsRequired: false,
    ferrySlot: 'N/A',
    delayFactors: [
      { name: 'French rail strike risk', impact: 22, category: 'infrastructure' },
      { name: 'Spanish customs slow processing', impact: 13, category: 'customs' },
    ],
  },
  {
    id: 'ECS-2024-7891',
    client: 'H&M Logistics AB',
    origin: 'Felixstowe, UK',
    destination: 'Antwerp, BE',
    route: 'UK → BE',
    carrier: 'Stena Line',
    eta: '2024-06-03 22:00',
    currentStatus: 'Ferry – On time',
    riskScore: 24,
    riskLevel: 'low',
    delayProbability: 18,
    predictedDelay: 0.0,
    containerType: 'Standard 20ft',
    weight: 9800,
    customsRequired: false,
    ferrySlot: 'Evening – 18:00',
    delayFactors: [
      { name: 'Minor swell expected', impact: 14, category: 'weather' },
      { name: 'Antwerp slot queue', impact: 10, category: 'capacity' },
    ],
  },
  {
    id: 'ECS-2024-7902',
    client: 'Inditex (Zara) NV',
    origin: 'Zeebrugge, BE',
    destination: 'Tilbury, UK',
    route: 'BE → UK',
    carrier: 'DFDS Seaways',
    eta: '2024-06-04 06:00',
    currentStatus: 'Pre-customs – Documentation check',
    riskScore: 83,
    riskLevel: 'critical',
    delayProbability: 79,
    predictedDelay: 3.6,
    containerType: 'Standard 40ft',
    weight: 14700,
    customsRequired: true,
    ferrySlot: 'Early morning – 04:00',
    delayFactors: [
      { name: 'UK HMRC clearance backlog', impact: 45, category: 'customs' },
      { name: 'Missing EORI documentation', impact: 22, category: 'customs' },
      { name: 'DFDS vessel delay', impact: 10, category: 'ferry' },
      { name: 'Tilbury terminal congestion', impact: 6, category: 'capacity' },
    ],
  },
  {
    id: 'ECS-2024-7913',
    client: 'DHL Supply Chain BE',
    origin: 'Zeebrugge, BE',
    destination: 'Dublin, IE',
    route: 'BE → IE',
    carrier: 'Irish Ferries',
    eta: '2024-06-04 18:00',
    currentStatus: 'In transit – Ferry',
    riskScore: 19,
    riskLevel: 'low',
    delayProbability: 12,
    predictedDelay: 0.0,
    containerType: 'Reefer 20ft',
    weight: 11300,
    customsRequired: false,
    ferrySlot: 'Afternoon – 14:00',
    delayFactors: [
      { name: 'Mild Atlantic swell', impact: 12, category: 'weather' },
      { name: 'Dublin slot minor queue', impact: 7, category: 'capacity' },
    ],
  },
];

export const routeStats: RouteStats[] = [
  { route: 'UK → BE (Zeebrugge)', avgDelay: 3.2, totalShipments: 847, onTime: 614, delayRate: 27.5, riskScore: 78 },
  { route: 'BE → UK (Tilbury)', avgDelay: 4.1, totalShipments: 762, onTime: 503, delayRate: 34.0, riskScore: 85 },
  { route: 'BE → UK (Hull)', avgDelay: 2.8, totalShipments: 421, onTime: 320, delayRate: 24.0, riskScore: 62 },
  { route: 'NL → BE (Road)', avgDelay: 1.6, totalShipments: 583, onTime: 489, delayRate: 16.1, riskScore: 44 },
  { route: 'BE → ES (Rail+Road)', avgDelay: 2.2, totalShipments: 214, onTime: 171, delayRate: 20.1, riskScore: 51 },
  { route: 'BE → IE (Ferry)', avgDelay: 1.1, totalShipments: 189, onTime: 169, delayRate: 10.6, riskScore: 28 },
  { route: 'BE → FR (Road)', avgDelay: 1.8, totalShipments: 304, onTime: 249, delayRate: 18.1, riskScore: 47 },
  { route: 'DE → BE (Road)', avgDelay: 0.9, totalShipments: 267, onTime: 238, delayRate: 10.9, riskScore: 22 },
];

export const supplierRisks: SupplierRisk[] = [
  { name: 'China Logistics Hub (Shanghai)', country: 'CN', avgDelayDays: 3.8, onTimeRate: 62, totalShipments: 284, riskScore: 88, trend: 'worsening' },
  { name: 'Maersk UK Feeder', country: 'UK', avgDelayDays: 2.9, onTimeRate: 71, totalShipments: 412, riskScore: 74, trend: 'stable' },
  { name: 'P&O Ferries', country: 'UK', avgDelayDays: 2.1, onTimeRate: 78, totalShipments: 634, riskScore: 61, trend: 'worsening' },
  { name: 'DFDS Seaways', country: 'DK', avgDelayDays: 1.8, onTimeRate: 82, totalShipments: 521, riskScore: 52, trend: 'stable' },
  { name: 'ECS Road Fleet', country: 'BE', avgDelayDays: 1.2, onTimeRate: 89, totalShipments: 876, riskScore: 31, trend: 'improving' },
  { name: 'DB Cargo Rail', country: 'DE', avgDelayDays: 0.8, onTimeRate: 93, totalShipments: 214, riskScore: 18, trend: 'improving' },
];

export const ferrySlots: FerrySlot[] = [
  { slot: '02:00 Night', route: 'Zeebrugge → Tilbury', delayRate: 41, avgDelay: 3.8, capacity: 100, fill: 94 },
  { slot: '06:00 Early AM', route: 'Zeebrugge → Tilbury', delayRate: 28, avgDelay: 2.1, capacity: 100, fill: 87 },
  { slot: '13:00 Afternoon', route: 'Zeebrugge → Tilbury', delayRate: 33, avgDelay: 2.9, capacity: 100, fill: 96 },
  { slot: '22:00 Evening', route: 'Felixstowe → Zeebrugge', delayRate: 19, avgDelay: 1.4, capacity: 80, fill: 68 },
  { slot: '18:00 Evening', route: 'Zeebrugge → Hull', delayRate: 22, avgDelay: 1.6, capacity: 80, fill: 71 },
  { slot: '14:00 Afternoon', route: 'Zeebrugge → Dublin', delayRate: 12, avgDelay: 0.9, capacity: 60, fill: 44 },
];

export const delayTrend = [
  { month: 'Jan', avgDelay: 2.8, onTime: 74, volume: 412 },
  { month: 'Feb', avgDelay: 3.1, onTime: 71, volume: 388 },
  { month: 'Mar', avgDelay: 2.4, onTime: 79, volume: 445 },
  { month: 'Apr', avgDelay: 2.9, onTime: 73, volume: 467 },
  { month: 'May', avgDelay: 3.4, onTime: 69, volume: 501 },
  { month: 'Jun', avgDelay: 3.7, onTime: 66, volume: 523 },
];

export const kpis = {
  totalActiveShipments: 523,
  criticalRisk: 18,
  highRisk: 47,
  avgDelayScore: 3.7,
  onTimeRate: 66,
  predictedDelaysToday: 31,
  customsBacklog: 14,
  ferryCapacityAlert: 3,
};
