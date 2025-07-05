import { Component, OnInit } from '@angular/core';
import { GpxService } from '../../services/gpx.service';

interface GpxInfo {
  name?: string;
  distance: number;
  points: number;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
}

@Component({
  selector: 'app-route-previsualization',
  templateUrl: './route-previsualization.component.html',
  styleUrls: ['./route-previsualization.component.css']
})
export class RoutePrevisualizationComponent implements OnInit {
  gpxData: string | null = null;
  gpxInfo: GpxInfo | null = null;

  constructor(private gpxService: GpxService) {}

  ngOnInit() {
    this.gpxService.gpxData$.subscribe(data => {
      this.gpxData = data;
      this.gpxInfo = data ? this.parseGpxInfo(data) : null;
    });
  }

  private parseGpxInfo(gpx: string): GpxInfo {
    const parser = new DOMParser();
    const xml = parser.parseFromString(gpx, 'text/xml');
    const name = xml.querySelector('trk > name')?.textContent || undefined;
    const trkpts = Array.from(xml.getElementsByTagName('trkpt'));
    const points = trkpts.length;
    let distance = 0;
    let startLat = 0, startLon = 0, endLat = 0, endLon = 0;
    if (points > 0) {
      startLat = parseFloat(trkpts[0].getAttribute('lat') || '0');
      startLon = parseFloat(trkpts[0].getAttribute('lon') || '0');
      endLat = parseFloat(trkpts[points-1].getAttribute('lat') || '0');
      endLon = parseFloat(trkpts[points-1].getAttribute('lon') || '0');
      for (let i = 1; i < points; i++) {
        const lat1 = parseFloat(trkpts[i-1].getAttribute('lat') || '0');
        const lon1 = parseFloat(trkpts[i-1].getAttribute('lon') || '0');
        const lat2 = parseFloat(trkpts[i].getAttribute('lat') || '0');
        const lon2 = parseFloat(trkpts[i].getAttribute('lon') || '0');
        distance += this.haversine(lat1, lon1, lat2, lon2);
      }
    }
    return { name, distance, points, startLat, startLon, endLat, endLon };
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
