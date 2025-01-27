import { inject, Injectable, signal } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { environment } from '../../../environments/environment';
import { ISystemDetailDto, ISystemUsageDto, IToken } from '../models/model';
import { FailedToNegotiateWithServerError, FailedToStartTransportError } from '@microsoft/signalr/dist/esm/Errors';
import { LOCAL_STORAGE } from '../constants/localstorage_contant';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private readonly hubConnection: HubConnection | null = new HubConnectionBuilder()
    .withUrl(environment.apiEndpoint + '/system-usage', {
      transport: HttpTransportType.WebSockets,
      accessTokenFactory: () => {
        const tokenstore = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN);
        if (!tokenstore) return '';
        const token = JSON.parse(tokenstore) as IToken;
        return token.accessToken;
      }
    })
    .configureLogging(environment.production ? LogLevel.Information : LogLevel.Debug)
    .build();
  private router = inject(Router);

  public systemUsage = signal<Array<ISystemUsageDto>>([]);
  public liveDataEnabled = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public systemDetails = signal<Partial<ISystemDetailDto>>({});

  startSignalRConnection(): void {
    if (this.hubConnection?.state === HubConnectionState.Disconnected) {
      this.hubConnection.start()
        .then(() => {
          if (this.hubConnection?.state === HubConnectionState.Connected) {

            this.hubConnection.on("GetSystenDetails", model => {
              this.systemDetails.set(model);
            });

            this.hubConnection.on("GetOldData", (model: Array<ISystemUsageDto>) => {
              const maxReducDatapoints = 69;
              this.systemUsage.update(prev => {
                const updatedValue = [...prev, ...model];
                if (updatedValue.length > maxReducDatapoints) {
                  updatedValue.splice(0, updatedValue.length - maxReducDatapoints);
                }
                return updatedValue;
              });
            });

            this.hubConnection.on("ReceiveSystemUsage", (model: ISystemUsageDto) => {
              const maxReducDatapoints = 69;
              this.systemUsage.update(prev => {
                const updatedValue = [...prev, model];
                if (updatedValue.length > maxReducDatapoints) {
                  updatedValue.splice(0, updatedValue.length - maxReducDatapoints);
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
            console.log("Error message : ", error.message);
          }
          this.router.navigate(['/signin'], { queryParams: { ReturnURL: window.location.pathname } });
        });
    }
  }

  destroyConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop();
    }
  }
}
