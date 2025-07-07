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
  private sub?: Subscription;

  constructor(private gpxService: GpxService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.gpxService.loadFromLocalStorage();
    this.sub = this.gpxService.gpxData$.subscribe(data => {
      this.gpxData = data;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  clearGpx() {
    this.gpxService.clear();
  }

  onGpxLoaded(gpx: string) {
    this.gpxService.setGpxData(gpx);
    this.snackBar.open('GPX route uploaded successfully!', 'Close', {
      duration: 3500,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['mat-elevation-z4', 'custom-snackbar']
    });
  }
}
