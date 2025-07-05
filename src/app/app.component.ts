import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Open-Route';
  gpxData: string | null = null;

  onGpxLoaded(gpx: string) {
    this.gpxData = gpx;
  }
}
