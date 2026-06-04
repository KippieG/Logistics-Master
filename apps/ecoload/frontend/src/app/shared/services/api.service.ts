import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReeferContainer } from '../models/reefer.model';
import { ConsolidationResult } from '../models/trailer.model';
import { Shipment } from '../models/shipment.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getReefers(): Observable<ReeferContainer[]> {
    return this.http.get<ReeferContainer[]>(`${this.base}/reefers`);
  }

  runDemoOptimization(): Observable<ConsolidationResult> {
    return this.http.post<ConsolidationResult>(`${this.base}/trailers/demo`, {});
  }

  getShipments(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.base}/customs`);
  }
}
