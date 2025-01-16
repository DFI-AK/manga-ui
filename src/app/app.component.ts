import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { SignalrService } from './core/services/signalr.service';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  public title = "Manga";
  private readonly signalRService = inject(SignalrService);
  private readonly systemUsage = inject(SignalrService).systemUsage;
  private readonly liveDataEnabled = inject(SignalrService).liveDataEnabled;
  public Highcharts: typeof Highcharts = Highcharts;

  public chartOptions: Highcharts.Options = {
    chart: {
      type: "line",
    },
    title: {
      text: "CPU Usage",
      align: "left"
    },
    credits: {
      enabled: false
    },
    series: [{
      type: "areaspline",
      data: [],
    }],
    xAxis: {
      type: "datetime",
      title: {
        text: "Timestamp"
      }
    },
    yAxis: {
      max: 100,
      min: 0,
      title: {
        text: "Percentage (%)"
      }
    }
  };

  private updateChart = effect(() => {
    this.chartOptions = ({
      ...this.chartOptions,
      series: [
        {
          type: "areaspline",
          data: this.systemUsage().map(s => ({ x: s.timeStamp, y: s.cpuUsagePercentage })),
          name: "CPU usage"
        }
      ]
    });

    // console.log(this.systemUsage().map(s => ({ x: s.timeStamp, y: s.cpuUsagePercentage })));

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
