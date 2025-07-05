import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login.component';
import { AuthGuard } from './services/auth.guard';

import { HomeComponent } from './components/home.component';
import { NavigatorComponent } from './components/navigator.component';
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
