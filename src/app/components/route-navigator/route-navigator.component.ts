import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GpxService } from '../../services/gpx.service';

@Component({
  selector: 'app-route-navigator',
  templateUrl: './route-navigator.component.html',
  styleUrls: ['./route-navigator.component.css']
})
export class RouteNavigatorComponent implements OnInit, OnDestroy {
  private heading = 0;
  private orientationListener: any;
  private map: any;
  private marker: any;
  private polyline: any;
  private startMarker: any;
  private endMarker: any;
  private watchId: number | null = null;
  error: string | null = null;
  private gpxData: string | null = null;

  constructor(
    private gpxService: GpxService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.gpxService.loadFromLocalStorage()
      .then(data => {
        console.debug('[NAV] GPX loaded:', data);
        this.gpxData = data;
        this.ensureLeaflet(() => {
          console.debug('[NAV] Leaflet ready, calling initMap');
          this.initMap();
        });
      })
      .catch(errorMsg => {
        console.error('[NAV] Error loading GPX data:', errorMsg);
        this.error = errorMsg;
        this.snackBar.open('Error loading GPX data: ' + errorMsg, 'Close', {
          duration: 5000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
          panelClass: ['mat-elevation-z4', 'custom-snackbar']
        });
      });
  }

  private ensureLeaflet(cb: () => void) {
    if ((window as any).L) {
      console.debug('[NAV] Leaflet already loaded');
      cb();
      return;
    }
    console.debug('[NAV] Loading Leaflet assets');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      console.debug('[NAV] Leaflet script loaded');
      cb();
    };
    document.body.appendChild(script);
  }

  ngOnDestroy() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.gpxData = null;
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
    this.startMarker = null;
    this.endMarker = null;
  }

  private initMap() {
    console.debug('[NAV] initMap called');
    const L = (window as any).L;
    const mapEl = document.querySelector('.map');
    if (!mapEl) {
      console.warn('[NAV] No map element found');
      return;
    }
    // Limpia el contenedor del mapa (por si quedó un canvas anterior)
    mapEl.innerHTML = '';
    // Si ya existe un mapa, elimínalo
    if (this.map) {
      console.debug('[NAV] Removing previous map instance');
      this.map.off();
      this.map.remove();
      this.map = null;
    }
    this.map = L.map(mapEl).setView([42.8782, -8.5448], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);
    if (this.gpxData) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(this.gpxData, 'text/xml');
      const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
      const path = trkpts.map(pt => ([parseFloat(pt.getAttribute('lat') || '0'), parseFloat(pt.getAttribute('lon') || '0')]));
      if (path.length > 0) {
        this.polyline = L.polyline(path, { color: '#1976d2', weight: 4 }).addTo(this.map);
        this.map.fitBounds(this.polyline.getBounds());
        // Add start and end markers
        const start = path[0];
        const end = path[path.length - 1];
        this.startMarker = L.marker(start, {
          icon: L.divIcon({
            className: 'start-marker',
            html: `<svg width="70" height="32" viewBox="0 0 70 32"><rect x="2" y="2" rx="12" ry="12" width="66" height="28" fill="#43a047" stroke="#fff" stroke-width="2"/><text x="35" y="22" text-anchor="middle" font-size="16" fill="#fff" font-family="Arial" font-weight="bold">Start</text></svg>`
          })
        }).addTo(this.map);
        this.endMarker = L.marker(end, {
          icon: L.divIcon({
            className: 'end-marker',
            html: `<svg width="70" height="32" viewBox="0 0 70 32"><rect x="2" y="2" rx="12" ry="12" width="66" height="28" fill="#d32f2f" stroke="#fff" stroke-width="2"/><text x="35" y="22" text-anchor="middle" font-size="16" fill="#fff" font-family="Arial" font-weight="bold">End</text></svg>`
          })
        }).addTo(this.map);
      }
    }
    console.debug('[NAV] Map initialized, starting navigation');
    this.startNavigation();
  }

  private startNavigation() {
    console.debug('[NAV] startNavigation called');
    this.orientationListener = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha === 'number') {
        let heading = 360 - event.alpha;
        // Detect if on mobile and in landscape mode
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile && window.screen && window.screen.orientation && window.screen.orientation.type) {
          const orientationType = window.screen.orientation.type;
          const angle = window.screen.orientation.angle;
          let orientationAdjusted = 0;
          switch (orientationType) {
            case 'portrait-primary':
              // Portrait mode, no adjustment needed
              break;
            case 'portrait-secondary':
              orientationAdjusted = 180;
              break;
            case 'landscape-primary':
              orientationAdjusted = 90;
              break;
            case 'landscape-secondary':
              orientationAdjusted = 270;
              break;
            default:
              console.warn('[NAV] Unknown orientation type:', orientationType);
              return;
          } 
          // Normalize heading to [0, 360)
          heading = (heading + orientationAdjusted) % 360;
        }
        this.heading = heading;
        this.updateMarkerRotation();
      }
    };
    const w: any = window;
    if ('ondeviceorientationabsolute' in w) {
      w.addEventListener('deviceorientationabsolute', this.orientationListener, true);
      console.debug('[NAV] deviceorientationabsolute listener added');
    } else if ('ondeviceorientation' in w) {
      w.addEventListener('deviceorientation', this.orientationListener, true);
      console.debug('[NAV] deviceorientation listener added');
    }
    if (!navigator.geolocation) {
      this.error = 'Geolocation is not supported.';
      console.warn('[NAV] Geolocation is not supported');
      return;
    }
    let firstPosition = true;
    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        this.error = null;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const L = (window as any).L;
        if (!this.marker) {
          this.marker = L.marker([lat, lon], {
            icon: L.divIcon({
              className: 'arrow-icon',
              html: `<svg id="arrow-svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 30,30 16,24 2,30" fill="#1976d2" stroke="#fff" stroke-width="2"/></svg>`
            })
          }).addTo(this.map);
          console.debug('[NAV] Marker created at', lat, lon);
        } else {
          this.marker.setLatLng([lat, lon]);
        }
        this.updateMarkerRotation();
        if (firstPosition) {
          this.map.setView([lat, lon], 17);
          console.debug('[NAV] First position, centering and zooming map');
          firstPosition = false;
        } else {
          this.map.panTo([lat, lon]);
        }
      },
      err => {
        let userMsg = 'Could not get position.';
        if (err.code === 1) {
          userMsg = 'Location permission denied. Please enable geolocation permissions in your browser.';
        } else if (err.code === 2) {
          userMsg = 'Location unavailable. Make sure GPS is enabled or try another device.';
        } else if (err.code === 3) {
          userMsg = 'Location request timed out. Please try again.';
        }
        this.error = userMsg;
        console.error('[NAV] Geolocation error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }

  stopNavigation() {
    console.debug('[NAV] stopNavigation called');
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.debug('[NAV] Cleared geolocation watch');
    }
    const w: any = window;
    if ('ondeviceorientationabsolute' in w) {
      w.removeEventListener('deviceorientationabsolute', this.orientationListener, true);
      console.debug('[NAV] Removed deviceorientationabsolute listener');
    } else if ('ondeviceorientation' in w) {
      w.removeEventListener('deviceorientation', this.orientationListener, true);
      console.debug('[NAV] Removed deviceorientation listener');
    }
    // Limpia el mapa y el marker para evitar residuos al volver
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
      console.debug('[NAV] Map instance destroyed');
    }
    this.marker = null;
    this.polyline = null;
    this.startMarker = null;
    this.endMarker = null;
    this.snackBar.open('Navigation stopped.', 'Close', {
      duration: 3500,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['mat-elevation-z4', 'custom-snackbar']
    });
    this.router.navigate(['/']);
  }

  private updateMarkerRotation() {
    const markerEl = this.marker && this.marker._icon;
    if (markerEl) {
      const svg = markerEl.querySelector('#arrow-svg');
      if (svg) {
        svg.style.transform = `rotate(${this.heading}deg)`;
        svg.style.transformOrigin = '50% 50%';
        console.debug('[NAV] Marker rotation updated:', this.heading);
      }
    }
  }

  goFullscreen() {
    const mapEl = document.querySelector('.map') as HTMLElement;
    if (mapEl && mapEl.requestFullscreen) {
      mapEl.requestFullscreen();
    }
  }

  exitFullscreen() {
    const d: any = document;
    if (d.exitFullscreen) {
      d.exitFullscreen();
    }
  }
}
