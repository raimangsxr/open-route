import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-gpx-upload',
  templateUrl: './gpx-upload.component.html',
  styleUrls: ['./gpx-upload.component.css']
})
export class GpxUploadComponent {
  @Output() gpxLoaded = new EventEmitter<string>();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.gpxLoaded.emit(reader.result as string);
      };
      reader.readAsText(file);
    }
  }
}
