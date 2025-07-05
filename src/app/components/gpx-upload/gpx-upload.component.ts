import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gpx-upload',
  templateUrl: './gpx-upload.component.html',
  styleUrls: ['./gpx-upload.component.css']
})
export class GpxUploadComponent {
  @Output() gpxLoaded = new EventEmitter<string>();

  constructor(private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.gpxLoaded.emit(reader.result as string);
        this.router.navigate(['/previsualization']);
      };
      reader.readAsText(file);
    }
  }
}
