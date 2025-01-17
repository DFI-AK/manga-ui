import { Component, effect, inject } from '@angular/core';
import { ISystemUsageDto } from '../core/models/model';
import { SignalrService } from '../core/services/signalr.service';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { SidebarComponent } from "../core/UI/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HighchartsChartModule, SidebarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private readonly signalRService = inject(SignalrService);
  private readonly systemUsage = inject(SignalrService).systemUsage;
  private readonly liveDataEnabled = inject(SignalrService).liveDataEnabled;
  public Highcharts: typeof Highcharts = Highcharts;

  private initialData = this.signalRService.systemUsage().map(d => ({
    cpuUsagePercentage: d.cpuUsagePercentage,
    memoryUsagePercentage: d.memoryUsagePercentage,
    diskUsage: { read: d.diskReadBytes, write: d.diskWriteBytes },
    networkTraffic: { transmit: d.networkBytesSent, received: d.networkBytesReceived },
    timeStamp: d.timeStamp
  }));

  private chartTitles: Record<string, string> = {
    cpuUsagePercentage: "CPU (%)",
    memoryUsagePercentage: "Memory (%)",
    diskUsage: "Disk usage (MB)",
    networkTraffic: "Network traffic",
  };

  public chartOptions: Highcharts.Options[] = Object.entries(this.chartTitles)
    .map(([key, opt]) => ({
      chart: {
        type: "area"
      },
      title: {
        text: opt,
        align: "left",
        style: {
          fontSize: "14px",
          fontWeight: "700"
        }
      },
      series: [{ type: "area", name: opt }],
      xAxis: {
        tickAmount: 5,
        type: "datetime",
        title: {
          text: "Timeline"
        },
      },
      yAxis: {
        title: {
          text: opt
        },
        labels: {
          formatter: e => {
            const property = key as keyof ISystemUsageDto;
            switch (property) {
              case "cpuUsagePercentage": {
                return e.value + ' %';
              }
              case "diskReadBytes": {
                const val = typeof e.value === "string" ? Number(e.value) : e.value;
                return (val / 1048576).toFixed(2) + "MB";
              }
              case "diskWriteBytes": {
                const val = typeof e.value === "string" ? Number(e.value) : e.value;
                return (val / 1048576).toFixed(2) + "MB";
              }
              case "memoryUsagePercentage": {
                return e.value + ' %';
              }
              case "networkBytesReceived": {
                const val = typeof e.value === "string" ? Number(e.value) : e.value;
                return (val / 1048576).toFixed(2) + "MB";
              }
              case "networkBytesSent": {
                const val = typeof e.value === "string" ? Number(e.value) : e.value;
                return (val / 1048576).toFixed(2) + "MB";
              }
              default: {
                return "";
              }
            }
          }
        },
      },
      legend: {
        align: "left",
      },
      credits: {
        enabled: false
      }
    }));

  private updateChart = effect(() => {
    this.chartOptions = Object.entries(this.chartTitles)
      .filter(([key, value]) => !key.includes("timeStamp"))
      .map(([key, value]) =>
      ({
        series: []
      })
      );


  }, { manualCleanup: true });


  ngOnInit(): void {
    this.signalRService.startSignalRConnection();
  }

  ngOnDestroy(): void {
    this.systemUsage.set([]);
    this.signalRService.destroyConnection();
    this.updateChart.destroy();
  }
}
