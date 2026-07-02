// ...existing code...
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GpxService } from '../../services/gpx.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  gpxData: string | null = null;

  constructor(private gpxService: GpxService, private snackBar: MatSnackBar) {}

  async ngOnInit() {
    try {
      this.gpxData = await this.gpxService.loadFromLocalStorage();
    } catch (error) {
      this.gpxData = null;
      console.error('Error loading GPX data:', error);
    }
  }

  ngOnDestroy() {}

  async clearGpx() {
    try {
      await this.gpxService.clear();
      this.gpxData = null;
      this.snackBar.open('GPX route cleared.', 'Close', {
        duration: 3500,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['mat-elevation-z4', 'custom-snackbar']
      });
    } catch (e) {
      this.snackBar.open('Error clearing GPX route.', 'Close', {
        duration: 3500,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['mat-elevation-z4', 'custom-snackbar']
      });
    }
  }

  async onGpxLoaded(gpx: string) {
    try {
      await this.gpxService.setGpxData(gpx);
      this.gpxData = gpx;
      this.snackBar.open('GPX route uploaded successfully!', 'Close', {
        duration: 3500,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['mat-elevation-z4', 'custom-snackbar']
      });
    } catch (e) {
      this.snackBar.open('Error saving GPX route.', 'Close', {
        duration: 3500,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['mat-elevation-z4', 'custom-snackbar']
      });
    }
  }
}
