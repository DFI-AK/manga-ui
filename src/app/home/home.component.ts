import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { DiskUsageKeys, ISystemUsageDto, NetworkTrafficKeys } from '../core/models/model';
import { SignalrService } from '../core/services/signalr.service';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { SidebarComponent } from "../core/UI/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import moment from 'moment';

type SystemMetric = {
  cpuUsagePercentage: number;
  memoryUsagePercentage: number;
  timeStamp: string;
};

type DiskUsage = {
  read: number,
  write: number;
  timeStamp: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HighchartsChartModule, SidebarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  private readonly signalRService = inject(SignalrService);
  private readonly systemUsage = inject(SignalrService).systemUsage;
  public Highcharts: typeof Highcharts = Highcharts;

  private chartTitles: Record<keyof SystemMetric, string> = {
    cpuUsagePercentage: "CPU usage(%)",
    memoryUsagePercentage: "Memory usage(%)",
    timeStamp: "Datetime"
  };

  private diskUsageSeriesName: Record<keyof DiskUsage, string> = {
    write: "Data write",
    read: "Data read",
    timeStamp: "Datetime"
  };

  private systemUsageData: Array<SystemMetric> = this.systemUsage().map(d => ({
    cpuUsagePercentage: d.cpuUsagePercentage,
    memoryUsagePercentage: d.memoryUsagePercentage,
    timeStamp: d.timeStamp
  }));

  private defaultColors = Highcharts.getOptions().colors || [
    "#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"
  ];

  public systemMetricOptions: Highcharts.Options[] = Object.entries(this.chartTitles)
    .filter(([key, value]) => key !== 'timeStamp')
    .map(([key, opt], idx) => ({
      chart: {
        type: "area",
        height: "380px"
      },
      title: {
        text: opt,
        align: "left",
        style: {
          fontSize: "12px",
          fontWeight: "700",
          fontFamily: "Poppins"
        }
      },
      series: [{
        name: opt,
        type: "area",
        lineWidth: 1.5,
        data: this.systemUsageData.map(s => ({ x: s.timeStamp, y: s[key as keyof SystemMetric] as number })),
        color: this.defaultColors[idx % this.defaultColors.length]
      }],
      xAxis: {
        type: "datetime",
        title: {
          text: ""
        },
        labels: {
          style: {
            fontSize: "10px",
            fontFamily: "Poppins",
            color: "#5c5c5cfb"
          }
        },
        crosshair: true
      },
      yAxis: {
        title: {
          text: ""
        },
        labels: {
          formatter: e => {
            const val = typeof e.value === "string" ? Number(e.value) : e.value;
            return val + ' %';
          },
          distance: 0.5,
          align: "left",
          y: -1,
          style: {
            fontSize: "10px",
            fontWeight: "500",
            fontFamily: "Poppins",
            color: "#5c5c5cfb"
          }
        },
        grid: {
          enabled: false
        },
        min: 0,
        max: 100
      },
      legend: {
        align: "left",
      },
      credits: {
        enabled: false
      }
    }));

  public diskUsageOption: Highcharts.Options = {
    chart: {
      type: "line",
      height: "380px"
    },
    title: {
      text: "Disk usage",
      align: "left",
      style: {
        fontSize: "12px",
        fontWeight: "700",
        fontFamily: "Poppins"
      }
    },
    xAxis: {
      type: "datetime",
      title: {
        text: ""
      },
      labels: {
        style: {
          fontSize: "10px",
          fontFamily: "Poppins",
          color: "#5c5c5cfb"
        }
      },
      crosshair: true
    },
    yAxis: {
      title: {
        text: ""
      },
      labels: {
        formatter: e => {
          const val = typeof e.value === "string" ? Number(e.value) : e.value;
          return (val / 1048576).toFixed(1) + 'MB';
        },
        distance: 0.5,
        align: "left",
        y: -1,
        style: {
          fontSize: "10px",
          fontWeight: "500",
          fontFamily: "Poppins"
        }
      },
      grid: {
        enabled: false
      },
    },
    legend: {
      align: "left",
    },
    credits: {
      enabled: false
    },
    series: Object.entries(this.diskUsageSeriesName)
      .filter(([key, _]) => key !== "timeStamp")
      .map(([key, value]) => ({
        type: "area",
        name: value,
        stacking: "normal",
        marker: { enabled: false }
      })),
    tooltip: {
      shared: true
    }
  };

  private updateChart = effect(() => {
    const systemUsageData: Array<SystemMetric> = this.systemUsage().map(d => ({
      cpuUsagePercentage: d.cpuUsagePercentage,
      memoryUsagePercentage: d.memoryUsagePercentage,
      timeStamp: d.timeStamp
    }));

    const diskUsageData: DiskUsage[] = this.systemUsage().map(d => ({
      read: d.diskReadBytes,
      write: d.diskWriteBytes,
      timeStamp: d.timeStamp
    }));

    this.systemMetricOptions = Object.entries(this.chartTitles)
      .filter(([key, value]) => key !== "timeStamp")
      .map(([key, value]) => ({
        series: [{
          type: "line",
          marker: {
            enabled: false
          },
          data: systemUsageData.map(s => ({ x: s.timeStamp, y: s[key as keyof SystemMetric] as number }))
        }]
      }));

    this.diskUsageOption = {
      series: Object.entries(this.diskUsageSeriesName)
        .filter(([key, _]) => key !== "timeStamp")
        .map(([key, value]) => ({
          name: value,
          type: "area",
          data: diskUsageData.map(s => ({ y: s[key as keyof DiskUsage] as number, x: s.timeStamp })),
          stacking: "normal"
        }))
    };

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
