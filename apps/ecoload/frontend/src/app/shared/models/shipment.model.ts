export type CustomsStatus = 'Cleared' | 'Pending' | 'Blocked' | 'InspectionRequired';
export type DocumentType = 'EUR1' | 'T1' | 'CMR' | 'PackingList' | 'HealthCertificate';

export interface Shipment {
  id: string;
  shipmentNumber: string;
  client: string;
  originCountry: string;
  destinationCountry: string;
  isUKBound: boolean;
  goodsValueEur: number;
  weightKg: number;
  documents: DocumentType[];
  status: CustomsStatus;
  blockReasons: string[];
  createdAt: string;
}
