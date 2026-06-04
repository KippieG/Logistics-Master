import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { TemperatureUpdate, CriticalAlert } from '../models/reefer.model';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5000/hubs/reefer')
    .withAutomaticReconnect()
    .build();

  temperatureUpdate$ = new Subject<TemperatureUpdate>();
  criticalAlert$ = new Subject<CriticalAlert>();
  connected$ = new Subject<boolean>();

  async start(): Promise<void> {
    this.hub.on('TemperatureUpdate', (data: TemperatureUpdate) => this.temperatureUpdate$.next(data));
    this.hub.on('CriticalAlert', (data: CriticalAlert) => this.criticalAlert$.next(data));

    this.hub.onreconnected(() => this.connected$.next(true));
    this.hub.onclose(() => this.connected$.next(false));

    try {
      await this.hub.start();
      this.connected$.next(true);
    } catch (err) {
      console.error('SignalR connection failed:', err);
      this.connected$.next(false);
    }
  }

  async subscribeToReefer(id: string): Promise<void> {
    if (this.hub.state === signalR.HubConnectionState.Connected) {
      await this.hub.invoke('Subscribe', id);
    }
  }
}
