// ...existing code...
import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private gpxService: GpxService) {}

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
  }
}
