import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GpxService } from '../services/gpx.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="header">
      <div class="header-left">
        <img src="assets/logo.svg" alt="Logo" class="logo" />
        <span class="title">Open-Route-FR</span>
      </div>
      <div class="header-center">
        <app-gpx-upload (gpxLoaded)="onGpxLoaded($event)"></app-gpx-upload>
      </div>
      <div class="header-right">
        <span class="icon profile" title="Perfil">👤</span>
        <span class="icon logout" title="Logout" (click)="logout()">🚪</span>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(
    private auth: AuthService,
    private router: Router,
    private gpxService: GpxService,
  ) {
  }

  onGpxLoaded(gpx: string) {
    this.gpxService.setGpxData(gpx);
  }


  logout() {
    this.auth.logout();
    this.gpxService.clear();
    this.router.navigate(['/login']);
  }
}
