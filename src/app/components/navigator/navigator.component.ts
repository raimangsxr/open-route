import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GpxService } from '../../services/gpx.service';

@Component({
  selector: 'app-navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.css']
})
export class NavigatorComponent implements OnInit, OnDestroy {
  private heading: number = 0;
  private orientationListener: any;
  private map: any;
  private marker: any;
  private polyline: any;
  private watchId: number | null = null;
  error: string | null = null;
  private gpxData: string | null = null;
  isFullscreen = false;
  private exitBtnEl: HTMLElement | null = null;
  private fullscreenHandler: (() => void) | null = null;

  constructor(private gpxService: GpxService, private router: Router) {
    if (typeof window !== 'undefined') {
      this.fullscreenHandler = () => {
        this.isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
        // Log visual para depuración
        console.log('[NAV] fullscreen event. isFullscreen:', this.isFullscreen);
        if (this.isFullscreen) {
          this.showExitFullscreenBtn();
        } else {
          this.removeExitFullscreenBtn();
        }
      };
      document.addEventListener('fullscreenchange', this.fullscreenHandler);
      document.addEventListener('webkitfullscreenchange', this.fullscreenHandler);
      document.addEventListener('msfullscreenchange', this.fullscreenHandler);
    }
  }
  private showExitFullscreenBtn() {
    if (this.exitBtnEl) return;
    const btn = document.createElement('button');
    btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.5em;">
      <svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align:middle"><path d="M2 7V2h5M18 7V2h-5M2 13v5h5M18 13v5h-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      Salir de pantalla completa
    </span>`;
    btn.className = 'exit-fullscreen-btn-global';
    // Todos los estilos ahora están en navigator.component.css
    btn.onclick = () => this.exitFullscreen();
    document.body.appendChild(btn);
    this.exitBtnEl = btn;
  }

  private removeExitFullscreenBtn() {
    if (this.exitBtnEl) {
      this.exitBtnEl.remove();
      this.exitBtnEl = null;
    }
  }
  ngOnInit() {
    this.gpxService.gpxData$.subscribe(data => {
      this.gpxData = data;
    });
  }

  ngAfterViewInit() {
    this.ensureLeaflet(() => this.initMap());
  }

  ngOnDestroy() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
    // Limpieza de listeners de pantalla completa
    if (typeof window !== 'undefined' && this.fullscreenHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenHandler);
      document.removeEventListener('webkitfullscreenchange', this.fullscreenHandler);
      document.removeEventListener('msfullscreenchange', this.fullscreenHandler);
    }
  }

  private ensureLeaflet(cb: () => void) {
    if ((window as any).L) {
      cb();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => cb();
    document.body.appendChild(script);
  }

  private initMap() {
    const L = (window as any).L;
    const mapEl = document.querySelector('.map');
    if (!mapEl) return;
    this.map = L.map(mapEl).setView([42.8782, -8.5448], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    // GPX parsing y dibujar ruta
    if (this.gpxData) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(this.gpxData, 'text/xml');
      const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
      const path = trkpts.map(pt => ([parseFloat(pt.getAttribute('lat') || '0'), parseFloat(pt.getAttribute('lon') || '0')]));
      if (path.length > 0) {
        this.polyline = L.polyline(path, { color: '#1976d2', weight: 4 }).addTo(this.map);
        this.map.fitBounds(this.polyline.getBounds());
      }
    }
    this.startNavigation();
  }

  private startNavigation() {
    // Escuchar orientación del dispositivo
    this.orientationListener = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha === 'number') {
        // En móviles, alpha es la dirección respecto al norte
        this.heading = 360 - event.alpha; // Corregir para que 0 sea norte
        this.updateMarkerRotation();
      }
    };
    const w: any = window;
    if ('ondeviceorientationabsolute' in w) {
      w.addEventListener('deviceorientationabsolute', this.orientationListener, true);
    } else if ('ondeviceorientation' in w) {
      w.addEventListener('deviceorientation', this.orientationListener, true);
    }
    if (!navigator.geolocation) {
      this.error = 'Geolocalización no soportada.';
      return;
    }
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
        } else {
          this.marker.setLatLng([lat, lon]);
        }
        this.updateMarkerRotation();
        this.map.setView([lat, lon]);
      },
      err => {
        this.error = 'No se pudo obtener la posición: ' + err.message;
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }

  stopNavigation() {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    const w: any = window;
    if ('ondeviceorientationabsolute' in w) {
      w.removeEventListener('deviceorientationabsolute', this.orientationListener, true);
    } else if ('ondeviceorientation' in w) {
      w.removeEventListener('deviceorientation', this.orientationListener, true);
    }
    this.removeExitFullscreenBtn();
    this.error = 'Navegación detenida.';
    setTimeout(() => this.router.navigate(['/']), 300);
  }

  private updateMarkerRotation() {
    // Rota el SVG de la flecha según el heading
    const markerEl = this.marker && this.marker._icon;
    if (markerEl) {
      const svg = markerEl.querySelector('#arrow-svg');
      if (svg) {
        svg.style.transform = `rotate(${this.heading}deg)`;
        svg.style.transformOrigin = '50% 50%';
      }
    }
  }

  goFullscreen() {
    const mapEl = document.querySelector('.map') as HTMLElement;
    if (mapEl && mapEl.requestFullscreen) {
      mapEl.requestFullscreen();
    } else if (mapEl && (mapEl as any).webkitRequestFullscreen) {
      (mapEl as any).webkitRequestFullscreen();
    } else if (mapEl && (mapEl as any).msRequestFullscreen) {
      (mapEl as any).msRequestFullscreen();
    }
  }

  exitFullscreen() {
    const d: any = document;
    if (d.exitFullscreen) {
      d.exitFullscreen();
    } else if (d.webkitExitFullscreen) {
      d.webkitExitFullscreen();
    } else if (d.msExitFullscreen) {
      d.msExitFullscreen();
    }
    this.removeExitFullscreenBtn();
  }
}
