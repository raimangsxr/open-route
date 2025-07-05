import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

import { HomeComponent } from './components/home/home.component';
import { NavigatorComponent } from './components/navigator/navigator.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'navigator', component: NavigatorComponent },
  { path: '', component: HomeComponent }
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
