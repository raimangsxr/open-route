import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Open-Route';
  gpxData: string | null = null;
  showHeader = true;

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((event: any) => {
      this.showHeader = !event.urlAfterRedirects.startsWith('/login');
    });
  }

  onGpxLoaded(gpx: string) {
    this.gpxData = gpx;
  }
}
