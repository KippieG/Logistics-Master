export type ReeferStatus = 'Normal' | 'Warning' | 'Critical' | 'Offline';

export interface ReeferContainer {
  id: string;
  containerNumber: string;
  client: string;
  destination: string;
  currentTemp: number;
  targetTempMin: number;
  targetTempMax: number;
  status: ReeferStatus;
  deviationCelsius: number;
  isOutOfRange: boolean;
  lastReading: string;
}

export interface TemperatureUpdate {
  id: string;
  containerNumber: string;
  currentTemp: number;
  targetTempMin: number;
  targetTempMax: number;
  status: ReeferStatus;
  deviationCelsius: number;
  timestamp: string;
}

export interface CriticalAlert {
  id: string;
  containerNumber: string;
  client: string;
  currentTemp: number;
  deviationCelsius: number;
  message: string;
}
