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
  styles: [
    `.header { display: flex; align-items: center; justify-content: space-between; background: #1976d2; color: #fff; padding: 0.5em 2em; }`,
    `.header-left { display: flex; align-items: center; }`,
    `.logo { width: 36px; height: 36px; margin-right: 1em; }`,
    `.title { font-size: 1.5em; font-weight: bold; }`,
    `.header-center { flex: 1; text-align: center; display: flex; gap: 1em; align-items: center; justify-content: center; }`,
    `.gpx-upload-btn { background: #fff; color: #1976d2; border: none; border-radius: 4px; padding: 0.5em 1em; font-weight: bold; cursor: pointer; }`,
    `.map-type-select { padding: 0.4em 1em; border-radius: 4px; border: 1px solid #1976d2; font-size: 1em; }`,
    `.header-right { display: flex; gap: 1em; align-items: center; }`,
    `.icon { font-size: 1.5em; cursor: pointer; }`
  ]
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
