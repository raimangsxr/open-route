import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

import { HomeComponent } from './components/home/home.component';
import { RouteNavigatorComponent } from './components/route-navigator/route-navigator.component';
import { RoutePrevisualizationComponent } from './components/route-previsualization/route-previsualization.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'navigator', component: RouteNavigatorComponent },
  { path: 'previsualization', component: RoutePrevisualizationComponent },
  { path: '', component: HomeComponent }
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
