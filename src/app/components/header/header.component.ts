import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GpxService } from '../../services/gpx.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
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
