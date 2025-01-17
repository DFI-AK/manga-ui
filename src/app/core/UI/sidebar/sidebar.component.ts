import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Bell, CircleArrowLeft, Database, Grid2X2, LayoutDashboard, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule,CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public collapsed: boolean = false;
  public dashboardIcon = LayoutDashboard;
  public windowsIcon = Grid2X2;
  public sqlServerIcon = Database;
  public arrowIcon = CircleArrowLeft;
}
