import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ISystemUsageDto } from '../models/model';
import { environment } from '../../../environments/environment';
import { SignalrService } from './signalr.service';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  private readonly http = inject(HttpClient);
  private readonly signalrService = inject(SignalrService);

  public getHistoricalSystemUsage = ({ endDate, startDate }: { startDate: Date, endDate: Date; }) => this.http
    .get<Array<ISystemUsageDto>>(environment.apiEndpoint + '/api/Metrics/GetHistoricalDataOfSystemUsage?startDate=' + startDate + '&endDate=' + endDate)
    .pipe(
      tap(response => {
        this.signalrService.systemUsage.set(response);
      }),
      catchError(err => throwError(() => err)));

}
