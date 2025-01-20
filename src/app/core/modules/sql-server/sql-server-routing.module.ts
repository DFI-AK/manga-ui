import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SqlServerComponent } from './pages/sql-server/sql-server.component';

const routes: Routes = [
  { path: "sql-servers", component: SqlServerComponent, title: "SQL Servers | Manga" }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SqlServerRoutingModule { }
