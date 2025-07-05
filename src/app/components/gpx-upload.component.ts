import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-gpx-upload',
  template: `
    <input type="file" accept=".gpx" (change)="onFileSelected($event)" hidden #fileInput />
    <button (click)="fileInput.click()" class="gpx-upload-btn">Subir GPX</button>
  `,
  styles: [`.gpx-upload-btn { background: #fff; color: #1976d2; border: none; border-radius: 4px; padding: 0.5em 1em; font-weight: bold; cursor: pointer; }`]
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
