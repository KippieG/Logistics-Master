export type CargoType = 'Ambient' | 'Chilled' | 'Frozen' | 'FMCG';
export type TrailerStatus = 'Loading' | 'ReadyForDispatch' | 'InTransit' | 'AtCustoms' | 'Delivered';

export interface Pallet {
  id: string;
  client: string;
  destination: string;
  weightKg: number;
  heightCm: number;
  cargoType: CargoType;
  requiresRefrigeration: boolean;
  density: number;
}

export interface LoadedPallet {
  pallet: Pallet;
  layer: number;
  positionInLayer: number;
}

export interface Trailer {
  id: string;
  trailerNumber: string;
  destination: string;
  loadedPallets: LoadedPallet[];
  totalUsedHeightCm: number;
  volumeUtilizationPct: number;
  heightUtilizationPct: number;
  totalWeightKg: number;
  status: TrailerStatus;
}

export interface ConsolidationResult {
  trailer: Trailer;
  unassignedPallets: Pallet[];
  estimatedCo2SavedKg: number;
  tripsSaved: number;
  optimizationSummary: string;
}
