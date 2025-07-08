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
    mapEl.innerHTML = '';
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
    const windowSize = 50; // Ventana fija de 50 puntos para orientación
    // Tamaño pequeño para el triángulo, para que nunca sobresalga del trazo
    const triangleWidth = 14; // px
    const triangleHeight = 18; // px
    for (let i = step; i < path.length; i += step) {
      // Determinar el centro de la flecha
      const centerIdx = i - Math.floor(step / 2);
      if (centerIdx < windowSize || centerIdx > path.length - windowSize - 1) continue;
      // Usar el ángulo entre el primer y último punto de la ventana
      const idxA = centerIdx - windowSize;
      const idxB = centerIdx + windowSize;
      if (idxA < 0 || idxB >= path.length) continue;
      const a = path[idxA];
      const b = path[idxB];
      // Mostrar los puntos de la ventana en rojo
      for (let w = -windowSize; w <= windowSize; w++) {
        const idx = centerIdx + w;
        if (idx < 0 || idx >= path.length) continue;
        const p = path[idx];
        // Usar pane personalizado para los puntos rojos, por debajo de las flechas
        if (!this.map.getPane('redPointsPane')) {
          this.map.createPane('redPointsPane');
          this.map.getPane('redPointsPane').style.zIndex = 410;
        }
        L.circleMarker([p[0], p[1]], {
          radius: 2.5,
          color: '#d32f2f',
          fillColor: '#d32f2f',
          fillOpacity: 1,
          weight: 1,
          pane: 'redPointsPane'
        }).addTo(this.map);
      }
      // Calcular ángulo entre a y b (extremos de la ventana) considerando cambios en latitud y longitud
      const dx = b[1] - a[1];
      const dy = b[0] - a[0];
      let angle = 0;
      const epsilon = 1e-5; // Umbral para considerar "sin cambio"
      if (Math.abs(dy) < epsilon && Math.abs(dx) >= epsilon) {
        // Latitud casi constante, solo cambia longitud: este-oeste
        angle = dx > 0 ? 90 : 270;
      } else if (Math.abs(dx) < epsilon && Math.abs(dy) >= epsilon) {
        // Longitud casi constante, solo cambia latitud: norte-sur
        angle = dy > 0 ? 0 : 180;
      } else if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon) {
        // Sin cambio apreciable
        angle = 0;
      } else {
        // Cambios en ambos ejes: ángulo real
        angle = Math.atan2(dy, dx) * 180 / Math.PI;
        // Ajustar a rango 0-360
        if (angle < 0) angle += 360;
      }
      // Triángulo isósceles blanco, vértice apunta en la dirección de la ruta
      const svg = `
        <svg width="${triangleWidth}" height="${triangleHeight}" viewBox="0 0 ${triangleWidth} ${triangleHeight}" style="overflow:visible">
          <polygon points="${triangleWidth/2},0 0,${triangleHeight} ${triangleWidth},${triangleHeight}"
            fill="#43a047" stroke="#fff" stroke-width="1.2" />
        </svg>
      `;
      // Usar pane personalizado para las flechas, por encima de los puntos rojos
      if (!this.map.getPane('arrowPane')) {
        this.map.createPane('arrowPane');
        this.map.getPane('arrowPane').style.zIndex = 420;
      }
      const marker = L.marker([path[centerIdx][0], path[centerIdx][1]], {
        icon: L.divIcon({
          className: 'route-arrow',
          html: `<span style="display:inline-block;transform:rotate(${angle}deg);width:${triangleWidth}px;height:${triangleHeight}px;position:relative;top:-${triangleHeight/2}px;left:-${triangleWidth/2}px;">${svg}</span>`
        }),
        interactive: false,
        pane: 'arrowPane'
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
