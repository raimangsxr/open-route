import { Component, OnInit, OnDestroy } from '@angular/core';
import { GpxService } from '../services/gpx.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <app-map [gpxData]="gpxData"></app-map>
      <button *ngIf="gpxData" class="navigator-btn" routerLink="/navigator">Iniciar ruta</button>
      <button *ngIf="gpxData" class="navigator-btn clear-btn" (click)="clearGpx()">Limpiar ruta</button>
    </div>
  `,
  styles: [
    `.home-container { padding: 2em; text-align: center; font-size: 1.5em; }`,
    `.navigator-btn { margin: 2em auto; display: block; background: #1976d2; color: #fff; border: none; border-radius: 6px; padding: 0.7em 2em; font-size: 1.1em; cursor: pointer; }`,
    `.clear-btn { background: #c00; margin-top: 1em; }`
  ]
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
}
