import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GpxService {
  private gpxDataSubject = new BehaviorSubject<string | null>(null);
  gpxData$ = this.gpxDataSubject.asObservable();

  setGpxData(data: string) {
    this.gpxDataSubject.next(data);
    try {
      localStorage.setItem('gpxData', data);
    } catch {}
  }

  clear() {
    this.gpxDataSubject.next(null);
    try {
      localStorage.removeItem('gpxData');
    } catch {}
  }
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('gpxData');
      if (data) {
        this.gpxDataSubject.next(data);
      }
    } catch {}
  }
}
