import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GpxService {
  async setGpxData(data: string): Promise<void> {
    try {
      localStorage.setItem('gpxData', data);
      return Promise.resolve();
    } catch (e) {
      console.debug('[GPX] Error saving to localStorage:', e);
      return Promise.reject(e);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem('gpxData');
      return Promise.resolve();
    } catch (e) {
      console.debug('[GPX] Error removing from localStorage:', e);
      return Promise.reject(e);
    }
  }

  async loadFromLocalStorage(): Promise<string> {
    try {
      const data = localStorage.getItem('gpxData');
      if (data) {
        return Promise.resolve(data);
      } else {
        const err = 'No GPX route stored in local storage';
        return Promise.reject(err);
      }
    } catch (e) {
      console.debug('[GPX] Error reading from localStorage:', e);
      return Promise.reject(e);
    }
  }
}
