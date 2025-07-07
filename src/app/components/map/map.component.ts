import { Component, Input, ElementRef, ViewChild, OnChanges, SimpleChanges, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnChanges, AfterViewInit {
  @Input() gpxData: string | null = null;
  @ViewChild('mapContainer', { static: false }) mapElement?: ElementRef;
  private map: any;
  private polyline: any;
  private leafletLoaded = false;
  private startMarker: any;
  private endMarker: any;

  ngAfterViewInit() {
    // Espera a que el elemento esté en el DOM y Leaflet esté cargado
    if (this.gpxData) {
      setTimeout(() => {
        this.ensureLeaflet(() => this.renderMap());
      }, 0);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gpxData'] && this.gpxData) {
      setTimeout(() => {
        if (this.mapElement) {
          this.ensureLeaflet(() => this.renderMap());
        }
      }, 0);
    }
    if (changes['gpxData'] && !this.gpxData) {
      this.destroyMap();
    }
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  private ensureLeaflet(cb: () => void) {
    if ((window as any).L) {
      this.leafletLoaded = true;
      cb();
      return;
    }
    if (this.leafletLoaded) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => { this.leafletLoaded = true; cb(); };
    document.body.appendChild(script);
  }

  private renderMap() {
    const L = (window as any).L;
    if (!this.mapElement) return;
    const mapEl = this.mapElement.nativeElement;
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
    this.map = L.map(mapEl).setView([42.8782, -8.5448], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    if (this.gpxData) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(this.gpxData, 'text/xml');
      const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
      const path: [number, number][] = trkpts.map(pt => [
        parseFloat(pt.getAttribute('lat') || '0'),
        parseFloat(pt.getAttribute('lon') || '0')
      ]);
      if (path.length > 0) {
        this.polyline = L.polyline(path, { color: '#1976d2', weight: 4 }).addTo(this.map);
        this.map.fitBounds(this.polyline.getBounds());
        // Añadir flechas de dirección sobre la ruta
        this.addArrowsToPolyline(path, L);
        // Añadir marcador de inicio
        if (this.startMarker) this.startMarker.remove();
        if (this.endMarker) this.endMarker.remove();
        this.startMarker = L.marker(path[0], {
          icon: L.divIcon({
            className: 'start-marker',
            html: '<span style="background:#43a047;color:#fff;padding:2px 6px;border-radius:4px;font-size:0.9em;">Start</span>'
          })
        }).addTo(this.map);
        // Añadir marcador de fin
        this.endMarker = L.marker(path[path.length-1], {
          icon: L.divIcon({
            className: 'end-marker',
            html: '<span style="background:#c62828;color:#fff;padding:2px 6px;border-radius:4px;font-size:0.9em;">End</span>'
          })
        }).addTo(this.map);
      }
    }
  }

  /**
   * Añade flechas de dirección sobre la ruta GPX usando divIcons rotados.
   */
  private addArrowsToPolyline(path: [number, number][], L: any) {
    // Elimina flechas anteriores si existen
    if ((this as any)._arrowMarkers) {
      (this as any)._arrowMarkers.forEach((m: any) => m.remove());
    }
    (this as any)._arrowMarkers = [];
    // Coloca una flecha cada N puntos (ajustable)
    const step = Math.max(1, Math.floor(path.length / 20)); // Máx 20 flechas
    for (let i = step; i < path.length; i += step) {
      const p1 = path[i - step];
      const p2 = path[i];
      if (!p1 || !p2) continue;
      const angle = this.getAngle(p1, p2);
      // Calcular el desplazamiento para centrar la flecha sobre el segmento
      // Usar interpolación geodésica para mayor precisión
      const t = 0.5; // punto medio del segmento
      const midLat = p1[0] + (p2[0] - p1[0]) * t;
      const midLng = p1[1] + (p2[1] - p1[1]) * t;
      const marker = L.marker([midLat, midLng], {
        icon: L.divIcon({
          className: 'route-arrow',
          html: `<span style="display:inline-block;transform:rotate(${angle}deg);font-size:2em;color:#1976d2;text-shadow:0 0 4px #fff,0 0 2px #fff;">&#8594;</span>`
        }),
        interactive: false
      }).addTo(this.map);
      (this as any)._arrowMarkers.push(marker);
    }
  }

  /**
   * Calcula el ángulo en grados entre dos puntos lat/lon para rotar la flecha.
   */
  private getAngle(p1: [number, number], p2: [number, number]): number {
    const dy = p2[0] - p1[0];
    const dx = (p2[1] - p1[1]) * Math.cos((p1[0] + p2[0]) * Math.PI / 360);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return angle;
  }

  private destroyMap() {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
      this.polyline = null;
    }
  }
}
