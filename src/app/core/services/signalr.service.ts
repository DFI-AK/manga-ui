import { Injectable, signal } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { environment } from '../../../environments/environment';
import { ISystemUsageDto } from '../models/model';
import { FailedToNegotiateWithServerError } from '@microsoft/signalr/dist/esm/Errors';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private readonly hubConnection: HubConnection | null = new HubConnectionBuilder()
    .withUrl(environment.apiEndpoint + '/system-usage', {
      transport: HttpTransportType.WebSockets
    })
    .configureLogging(environment.production ? LogLevel.Information : LogLevel.Debug)
    .build();

  public systemUsage = signal<Array<ISystemUsageDto>>([]);
  public liveDataEnabled = signal<boolean>(false);
  public errorMessage = signal<string>('');

  startSignalRConnection(): void {
    if (this.hubConnection?.state === HubConnectionState.Disconnected) {
      this.hubConnection.start()
        .then(() => {
          if (this.hubConnection?.state === HubConnectionState.Connected) {
            this.hubConnection.on("ReceiveSystemUsage", (model: ISystemUsageDto) => {
              this.systemUsage.update(prev => {
                const updatedValue = [...prev, model];
                if (updatedValue.length > 10) {
                  updatedValue.splice(0, updatedValue.length - 10);
                }
                return updatedValue;
              });
            });

            this.hubConnection.on("ReceiveRunningStatus", (isLiveData: boolean) => {
              this.liveDataEnabled.set(isLiveData);
            });
          }
        }).catch(error => {
          if (error instanceof FailedToNegotiateWithServerError) {
            this.errorMessage.set(error.message);
          }
          // this.startSignalRConnection();
        });
    }
  }

  destroyConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop();
    }
  }
}
