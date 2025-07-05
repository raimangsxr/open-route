import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { GpxUploadComponent } from './components/gpx-upload/gpx-upload.component';
import { MapComponent } from './components/map/map.component';
import { NavigatorComponent } from './components/navigator/navigator.component';
import { HomeComponent } from './components/home/home.component';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    GpxUploadComponent,
    MapComponent,
    HomeComponent,
    NavigatorComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
